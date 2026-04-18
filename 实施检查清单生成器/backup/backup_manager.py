#!/usr/bin/env python3
"""
US13: 数据备份与恢复系统
实现自动备份计划、数据版本管理、恢复点创建和回滚、灾难恢复方案
"""

import json
import uuid
import gzip
import hashlib
import os
import shutil
import sqlite3
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, field, asdict
import logging
import threading
import schedule
import time

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BackupType(Enum):
    """备份类型"""
    FULL = "full"                # 全量备份
    INCREMENTAL = "incremental"  # 增量备份
    SNAPSHOT = "snapshot"        # 快照


class BackupStatus(Enum):
    """备份状态"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class BackupPlan:
    """备份计划"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    enabled: bool = True
    backup_type: str = BackupType.FULL.value
    schedule_type: str = "daily"    # daily/weekly/monthly
    schedule_time: str = "02:00"     # 执行时间
    schedule_day: int = 0            # 周几（0=周一）或每月几号
    retention_days: int = 30          # 保留天数
    compression: bool = True
    encryption: bool = False
    encryption_key: Optional[str] = None
    target_paths: List[str] = field(default_factory=list)  # 备份目标路径
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    last_run_at: Optional[str] = None
    last_status: Optional[str] = None
    last_backup_id: Optional[str] = None
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'BackupPlan':
        return cls(**data)


@dataclass
class RecoveryPoint:
    """恢复点"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    plan_id: str = ""
    backup_id: str = ""
    version: str = ""               # 语义版本号，如 1.0.0
    description: str = ""
    backup_type: str = BackupType.FULL.value
    file_path: str = ""             # 备份文件路径
    file_size: int = 0              # 字节
    checksum: str = ""               # MD5校验和
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    is_snapshot: bool = False
    parent_backup_id: Optional[str] = None  # 增量备份的父备份
    metadata: Dict = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'RecoveryPoint':
        return cls(**data)


@dataclass
class Snapshot:
    """数据快照"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    source_data: Dict = field(default_factory=dict)  # 快照数据
    checksum: str = ""
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    tags: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Snapshot':
        return cls(**data)


@dataclass
class DisasterRecoveryPlan:
    """灾难恢复计划"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    rto_minutes: int = 60           # 恢复时间目标（分钟）
    rpo_minutes: int = 15           # 恢复点目标（分钟）
    backup_locations: List[str] = field(default_factory=list)  # 备份位置列表
    recovery_steps: List[Dict] = field(default_factory=list)
    test_schedule: str = "monthly"
    last_test_at: Optional[str] = None
    last_test_status: Optional[str] = None
    is_active: bool = True
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'DisasterRecoveryPlan':
        return cls(**data)


class BackupManager:
    """
    备份恢复管理器
    支持自动备份、数据版本管理、恢复点创建和回滚、灾难恢复
    """
    
    def __init__(self, storage_path: Optional[str] = None):
        """初始化备份管理器"""
        self.storage_path = storage_path or "./backup_storage"
        self.plans: List[BackupPlan] = []
        self.recovery_points: List[RecoveryPoint] = []
        self.snapshots: List[Snapshot] = []
        self.disaster_recovery_plans: List[DisasterRecoveryPlan] = []
        self.scheduler_thread: Optional[threading.Thread] = None
        self.scheduler_running = False
        
        # 确保存储目录存在
        os.makedirs(self.storage_path, exist_ok=True)
        os.makedirs(f"{self.storage_path}/backups", exist_ok=True)
        os.makedirs(f"{self.storage_path}/snapshots", exist_ok=True)
        os.makedirs(f"{self.storage_path}/metadata", exist_ok=True)
        
        # 加载数据
        self._load_metadata()
        
        # 创建默认灾难恢复计划
        if not self.disaster_recovery_plans:
            self._create_default_dr_plan()
    
    def _load_metadata(self):
        """加载元数据"""
        try:
            with open(f"{self.storage_path}/metadata/plans.json", 'r') as f:
                data = json.load(f)
                self.plans = [BackupPlan.from_dict(p) for p in data]
        except FileNotFoundError:
            pass
        
        try:
            with open(f"{self.storage_path}/metadata/recovery_points.json", 'r') as f:
                data = json.load(f)
                self.recovery_points = [RecoveryPoint.from_dict(rp) for rp in data]
        except FileNotFoundError:
            pass
        
        try:
            with open(f"{self.storage_path}/metadata/snapshots.json", 'r') as f:
                data = json.load(f)
                self.snapshots = [Snapshot.from_dict(s) for s in data]
        except FileNotFoundError:
            pass
        
        try:
            with open(f"{self.storage_path}/metadata/dr_plans.json", 'r') as f:
                data = json.load(f)
                self.disaster_recovery_plans = [DisasterRecoveryPlan.from_dict(dr) for dr in data]
        except FileNotFoundError:
            pass
    
    def _save_metadata(self):
        """保存元数据"""
        with open(f"{self.storage_path}/metadata/plans.json", 'w') as f:
            json.dump([p.to_dict() for p in self.plans], f, indent=2)
        
        with open(f"{self.storage_path}/metadata/recovery_points.json", 'w') as f:
            json.dump([rp.to_dict() for rp in self.recovery_points], f, indent=2)
        
        with open(f"{self.storage_path}/metadata/snapshots.json", 'w') as f:
            json.dump([s.to_dict() for s in self.snapshots], f, indent=2)
        
        with open(f"{self.storage_path}/metadata/dr_plans.json", 'w') as f:
            json.dump([dr.to_dict() for dr in self.disaster_recovery_plans], f, indent=2)
    
    def _create_default_dr_plan(self):
        """创建默认灾难恢复计划"""
        default_dr = DisasterRecoveryPlan(
            id="default_dr_plan",
            name="默认灾难恢复计划",
            description="系统默认的灾难恢复计划",
            rto_minutes=60,
            rpo_minutes=15,
            backup_locations=[self.storage_path],
            recovery_steps=[
                {"step": 1, "action": "确认故障", "description": "确认系统故障范围"},
                {"step": 2, "action": "激活备份", "description": "激活最新备份"},
                {"step": 3, "action": "验证数据", "description": "验证恢复数据完整性"},
                {"step": 4, "action": "切换系统", "description": "切换到恢复系统"},
                {"step": 5, "action": "通知用户", "description": "通知相关人员"}
            ],
            test_schedule="monthly"
        )
        self.disaster_recovery_plans.append(default_dr)
        self._save_metadata()
    
    # ==================== 备份计划管理 ====================
    
    def create_plan(
        self,
        name: str,
        backup_type: str = BackupType.FULL.value,
        schedule_type: str = "daily",
        schedule_time: str = "02:00",
        retention_days: int = 30,
        target_paths: Optional[List[str]] = None,
        compression: bool = True,
        description: str = ""
    ) -> BackupPlan:
        """创建备份计划"""
        plan = BackupPlan(
            name=name,
            description=description,
            backup_type=backup_type,
            schedule_type=schedule_type,
            schedule_time=schedule_time,
            retention_days=retention_days,
            target_paths=target_paths or [],
            compression=compression
        )
        self.plans.append(plan)
        self._save_metadata()
        logger.info(f"创建备份计划: {name}")
        return plan
    
    def update_plan(self, plan_id: str, updates: Dict) -> Optional[BackupPlan]:
        """更新备份计划"""
        for plan in self.plans:
            if plan.id == plan_id:
                for key, value in updates.items():
                    if hasattr(plan, key):
                        setattr(plan, key, value)
                self._save_metadata()
                logger.info(f"更新备份计划: {plan.name}")
                return plan
        return None
    
    def delete_plan(self, plan_id: str) -> bool:
        """删除备份计划"""
        self.plans = [p for p in self.plans if p.id != plan_id]
        self._save_metadata()
        return True
    
    def get_plan(self, plan_id: str) -> Optional[BackupPlan]:
        """获取备份计划"""
        for plan in self.plans:
            if plan.id == plan_id:
                return plan
        return None
    
    def get_all_plans(self) -> List[BackupPlan]:
        """获取所有备份计划"""
        return self.plans
    
    def enable_plan(self, plan_id: str) -> bool:
        """启用备份计划"""
        plan = self.get_plan(plan_id)
        if plan:
            plan.enabled = True
            self._save_metadata()
            return True
        return False
    
    def disable_plan(self, plan_id: str) -> bool:
        """禁用备份计划"""
        plan = self.get_plan(plan_id)
        if plan:
            plan.enabled = False
            self._save_metadata()
            return True
        return False
    
    # ==================== 备份执行 ====================
    
    def execute_backup(self, plan_id: str, source_data: Dict[str, Any]) -> RecoveryPoint:
        """执行备份"""
        plan = self.get_plan(plan_id)
        if not plan:
            raise ValueError(f"备份计划不存在: {plan_id}")
        
        plan.last_status = BackupStatus.IN_PROGRESS.value
        self._save_metadata()
        
        try:
            # 生成备份ID和版本
            backup_id = str(uuid.uuid4())
            version = self._generate_version(plan_id)
            
            # 准备备份数据
            if plan.backup_type == BackupType.INCREMENTAL.value:
                # 增量备份：只备份变更部分
                backup_data = self._prepare_incremental_backup(plan_id, source_data)
            else:
                # 全量备份
                backup_data = source_data
            
            # 序列化并压缩
            json_data = json.dumps(backup_data, ensure_ascii=False, indent=2)
            
            if plan.compression:
                json_bytes = json_data.encode('utf-8')
                compressed_data = gzip.compress(json_bytes)
                file_path = f"{self.storage_path}/backups/{backup_id}.gz"
                with open(file_path, 'wb') as f:
                    f.write(compressed_data)
            else:
                file_path = f"{self.storage_path}/backups/{backup_id}.json"
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(json_data)
            
            # 计算校验和
            checksum = hashlib.md5(open(file_path, 'rb').read()).hexdigest()
            
            # 创建恢复点
            recovery_point = RecoveryPoint(
                plan_id=plan_id,
                backup_id=backup_id,
                version=version,
                description=f"{plan.name} - {version}",
                backup_type=plan.backup_type,
                file_path=file_path,
                file_size=os.path.getsize(file_path),
                checksum=checksum,
                parent_backup_id=self._get_last_backup_id(plan_id)
            )
            
            self.recovery_points.append(recovery_point)
            
            # 更新计划状态
            plan.last_run_at = datetime.now().isoformat()
            plan.last_status = BackupStatus.COMPLETED.value
            plan.last_backup_id = backup_id
            
            # 清理过期备份
            self._cleanup_old_backups(plan)
            
            self._save_metadata()
            logger.info(f"备份完成: {plan.name}, 版本: {version}")
            
            return recovery_point
        
        except Exception as e:
            plan.last_status = BackupStatus.FAILED.value
            self._save_metadata()
            logger.error(f"备份失败: {plan.name}, 错误: {str(e)}")
            raise
    
    def _generate_version(self, plan_id: str) -> str:
        """生成语义版本号"""
        existing_versions = [
            rp.version for rp in self.recovery_points
            if rp.plan_id == plan_id
        ]
        
        if not existing_versions:
            return "1.0.0"
        
        # 解析最新版本
        latest = sorted(existing_versions, reverse=True)[0]
        parts = latest.split('.')
        major, minor, patch = int(parts[0]), int(parts[1]), int(parts[2])
        
        # 根据备份类型递增
        plan = self.get_plan(plan_id)
        if plan and plan.backup_type == BackupType.INCREMENTAL.value:
            patch += 1
        else:
            minor += 1
            patch = 0
        
        return f"{major}.{minor}.{patch}"
    
    def _get_last_backup_id(self, plan_id: str) -> Optional[str]:
        """获取上一次备份ID"""
        plan_points = [rp for rp in self.recovery_points if rp.plan_id == plan_id]
        if plan_points:
            sorted_points = sorted(plan_points, key=lambda x: x.created_at, reverse=True)
            return sorted_points[0].backup_id
        return None
    
    def _prepare_incremental_backup(self, plan_id: str, source_data: Dict) -> Dict:
        """准备增量备份数据"""
        last_backup = self._get_last_backup(plan_id)
        
        if not last_backup:
            # 如果没有上次备份，执行全量备份
            return source_data
        
        # 比较数据变更
        last_data = self._restore_without_apply(last_backup)
        incremental_data = self._compute_diff(last_data, source_data)
        
        return {
            '_is_incremental': True,
            '_parent_backup_id': last_backup.backup_id,
            '_changes': incremental_data
        }
    
    def _get_last_backup(self, plan_id: str) -> Optional[RecoveryPoint]:
        """获取最近一次备份"""
        plan_points = [rp for rp in self.recovery_points if rp.plan_id == plan_id]
        if plan_points:
            return sorted(plan_points, key=lambda x: x.created_at, reverse=True)[0]
        return None
    
    def _restore_without_apply(self, recovery_point: RecoveryPoint) -> Dict:
        """读取备份数据但不应用"""
        with open(recovery_point.file_path, 'rb' if recovery_point.file_path.endswith('.gz') else 'r') as f:
            if recovery_point.file_path.endswith('.gz'):
                data = gzip.decompress(f.read())
                return json.loads(data.decode('utf-8'))
            else:
                return json.loads(f.read())
    
    def _compute_diff(self, old_data: Dict, new_data: Dict) -> Dict:
        """计算数据差异"""
        diff = {}
        
        for key, value in new_data.items():
            if key not in old_data:
                diff[key] = {'op': 'add', 'value': value}
            elif old_data[key] != value:
                if isinstance(old_data[key], dict) and isinstance(value, dict):
                    nested_diff = self._compute_diff(old_data[key], value)
                    if nested_diff:
                        diff[key] = {'op': 'modify', 'value': nested_diff}
                else:
                    diff[key] = {'op': 'modify', 'old': old_data[key], 'new': value}
        
        for key in old_data:
            if key not in new_data:
                diff[key] = {'op': 'delete', 'value': old_data[key]}
        
        return diff
    
    def _cleanup_old_backups(self, plan: BackupPlan):
        """清理过期备份"""
        cutoff_date = datetime.now() - timedelta(days=plan.retention_days)
        
        plan_points = [rp for rp in self.recovery_points if rp.plan_id == plan.id]
        for rp in plan_points:
            created = datetime.fromisoformat(rp.created_at)
            if created < cutoff_date:
                # 删除备份文件
                if os.path.exists(rp.file_path):
                    os.remove(rp.file_path)
                # 从列表移除
                self.recovery_points.remove(rp)
                logger.info(f"删除过期备份: {rp.version}")
    
    # ==================== 快照管理 ====================
    
    def create_snapshot(
        self,
        name: str,
        source_data: Dict[str, Any],
        description: str = "",
        tags: Optional[List[str]] = None
    ) -> Snapshot:
        """创建快照"""
        snapshot_data = json.dumps(source_data, ensure_ascii=False)
        checksum = hashlib.md5(snapshot_data.encode('utf-8')).hexdigest()
        
        snapshot = Snapshot(
            name=name,
            description=description,
            source_data=source_data,
            checksum=checksum,
            tags=tags or []
        )
        
        self.snapshots.append(snapshot)
        
        # 保存快照文件
        file_path = f"{self.storage_path}/snapshots/{snapshot.id}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(snapshot_data)
        
        self._save_metadata()
        logger.info(f"创建快照: {name}")
        
        return snapshot
    
    def get_snapshot(self, snapshot_id: str) -> Optional[Snapshot]:
        """获取快照"""
        for snapshot in self.snapshots:
            if snapshot.id == snapshot_id:
                return snapshot
        return None
    
    def get_all_snapshots(self) -> List[Snapshot]:
        """获取所有快照"""
        return sorted(self.snapshots, key=lambda s: s.created_at, reverse=True)
    
    def delete_snapshot(self, snapshot_id: str) -> bool:
        """删除快照"""
        for snapshot in self.snapshots:
            if snapshot.id == snapshot_id:
                # 删除文件
                file_path = f"{self.storage_path}/snapshots/{snapshot.id}.json"
                if os.path.exists(file_path):
                    os.remove(file_path)
                self.snapshots.remove(snapshot)
                self._save_metadata()
                return True
        return False
    
    # ==================== 恢复操作 ====================
    
    def restore(
        self,
        recovery_point_id: str,
        target_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """恢复数据"""
        recovery_point = self._get_recovery_point(recovery_point_id)
        if not recovery_point:
            raise ValueError(f"恢复点不存在: {recovery_point_id}")
        
        # 读取备份数据
        with open(recovery_point.file_path, 'rb' if recovery_point.file_path.endswith('.gz') else 'r') as f:
            if recovery_point.file_path.endswith('.gz'):
                data = gzip.decompress(f.read()).decode('utf-8')
            else:
                data = f.read()
        
        backup_data = json.loads(data)
        
        # 如果是增量备份，需要重建完整数据
        if isinstance(backup_data, dict) and backup_data.get('_is_incremental'):
            backup_data = self._reconstruct_full_backup(recovery_point)
        
        # 如果指定了目标路径，保存到目标位置
        if target_path:
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            with open(target_path, 'w', encoding='utf-8') as f:
                json.dump(backup_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"恢复完成: {recovery_point.version}")
        
        return backup_data
    
    def restore_to_point_in_time(
        self,
        plan_id: str,
        target_time: datetime,
        target_path: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """恢复到指定时间点"""
        plan_points = [
            rp for rp in self.recovery_points
            if rp.plan_id == plan_id
        ]
        
        # 找到目标时间之前最近的备份
        valid_points = [
            rp for rp in plan_points
            if datetime.fromisoformat(rp.created_at) <= target_time
        ]
        
        if not valid_points:
            return None
        
        latest_point = sorted(valid_points, key=lambda x: x.created_at, reverse=True)[0]
        return self.restore(latest_point.id, target_path)
    
    def _get_recovery_point(self, recovery_point_id: str) -> Optional[RecoveryPoint]:
        """获取恢复点"""
        for rp in self.recovery_points:
            if rp.id == recovery_point_id:
                return rp
        return None
    
    def _reconstruct_full_backup(self, recovery_point: RecoveryPoint) -> Dict:
        """重建完整备份数据"""
        if not recovery_point.parent_backup_id:
            return self.restore(recovery_point.id)
        
        parent_rp = self._get_recovery_point_by_backup_id(recovery_point.parent_backup_id)
        if not parent_rp:
            return self.restore(recovery_point.id)
        
        # 递归重建父备份
        parent_data = self._reconstruct_full_backup(parent_rp)
        
        # 读取当前备份的变更
        current_data = self.restore(recovery_point.id)
        
        # 应用变更
        changes = current_data.get('_changes', {})
        return self._apply_changes(parent_data, changes)
    
    def _get_recovery_point_by_backup_id(self, backup_id: str) -> Optional[RecoveryPoint]:
        """通过备份ID获取恢复点"""
        for rp in self.recovery_points:
            if rp.backup_id == backup_id:
                return rp
        return None
    
    def _apply_changes(self, base_data: Dict, changes: Dict) -> Dict:
        """应用变更到基础数据"""
        result = base_data.copy()
        
        for key, change in changes.items():
            op = change.get('op')
            if op == 'add':
                result[key] = change['value']
            elif op == 'modify':
                if isinstance(change['value'], dict):
                    result[key] = self._apply_changes(result.get(key, {}), change['value'])
                else:
                    result[key] = change['new']
            elif op == 'delete':
                if key in result:
                    del result[key]
        
        return result
    
    # ==================== 灾难恢复 ====================
    
    def create_dr_plan(
        self,
        name: str,
        rto_minutes: int = 60,
        rpo_minutes: int = 15,
        recovery_steps: Optional[List[Dict]] = None,
        description: str = ""
    ) -> DisasterRecoveryPlan:
        """创建灾难恢复计划"""
        dr_plan = DisasterRecoveryPlan(
            name=name,
            description=description,
            rto_minutes=rto_minutes,
            rpo_minutes=rpo_minutes,
            recovery_steps=recovery_steps or []
        )
        self.disaster_recovery_plans.append(dr_plan)
        self._save_metadata()
        return dr_plan
    
    def get_dr_plan(self, plan_id: str) -> Optional[DisasterRecoveryPlan]:
        """获取灾难恢复计划"""
        for plan in self.disaster_recovery_plans:
            if plan.id == plan_id:
                return plan
        return None
    
    def get_all_dr_plans(self) -> List[DisasterRecoveryPlan]:
        """获取所有灾难恢复计划"""
        return self.disaster_recovery_plans
    
    def test_dr_plan(self, plan_id: str) -> Dict:
        """测试灾难恢复计划"""
        dr_plan = self.get_dr_plan(plan_id)
        if not dr_plan:
            raise ValueError(f"灾难恢复计划不存在: {plan_id}")
        
        # 模拟测试过程
        test_result = {
            'plan_id': plan_id,
            'plan_name': dr_plan.name,
            'test_started_at': datetime.now().isoformat(),
            'steps_completed': [],
            'status': 'in_progress'
        }
        
        for step in dr_plan.recovery_steps:
            test_result['steps_completed'].append({
                'step': step['step'],
                'action': step['action'],
                'status': 'passed',
                'completed_at': datetime.now().isoformat()
            })
        
        test_result['status'] = 'passed'
        test_result['test_completed_at'] = datetime.now().isoformat()
        
        # 更新计划状态
        dr_plan.last_test_at = datetime.now().isoformat()
        dr_plan.last_test_status = 'passed'
        self._save_metadata()
        
        return test_result
    
    # ==================== 调度器 ====================
    
    def start_scheduler(self):
        """启动调度器"""
        if self.scheduler_running:
            return
        
        self.scheduler_running = True
        self.scheduler_thread = threading.Thread(target=self._run_scheduler)
        self.scheduler_thread.daemon = True
        self.scheduler_thread.start()
        logger.info("备份调度器已启动")
    
    def stop_scheduler(self):
        """停止调度器"""
        self.scheduler_running = False
        if self.scheduler_thread:
            self.scheduler_thread.join(timeout=5)
        logger.info("备份调度器已停止")
    
    def _run_scheduler(self):
        """运行调度器"""
        while self.scheduler_running:
            schedule.run_pending()
            
            # 为每个启用的计划设置调度任务
            for plan in self.plans:
                if not plan.enabled:
                    continue
                
                job_id = f"backup_{plan.id}"
                
                if plan.schedule_type == "daily":
                    schedule.every().day.at(plan.schedule_time).do(
                        self._scheduled_backup, plan.id
                    ).tag(job_id)
                elif plan.schedule_type == "weekly":
                    schedule.every().week.at(plan.schedule_time).do(
                        self._scheduled_backup, plan.id
                    ).tag(job_id)
                elif plan.schedule_type == "monthly":
                    schedule.every().month.at(plan.schedule_time).do(
                        self._scheduled_backup, plan.id
                    ).tag(job_id)
            
            time.sleep(60)  # 每分钟检查一次
    
    def _scheduled_backup(self, plan_id: str):
        """调度备份执行"""
        try:
            # 准备示例数据
            source_data = {
                'timestamp': datetime.now().isoformat(),
                'checklists': [],
                'templates': [],
                'settings': {}
            }
            self.execute_backup(plan_id, source_data)
        except Exception as e:
            logger.error(f"调度备份失败: {plan_id}, 错误: {str(e)}")
    
    # ==================== 统计和报告 ====================
    
    def get_backup_stats(self) -> Dict:
        """获取备份统计"""
        total_size = 0
        for rp in self.recovery_points:
            total_size += rp.file_size
        
        return {
            'total_plans': len(self.plans),
            'enabled_plans': sum(1 for p in self.plans if p.enabled),
            'total_recovery_points': len(self.recovery_points),
            'total_snapshots': len(self.snapshots),
            'total_backup_size': total_size,
            'total_backup_size_mb': round(total_size / 1024 / 1024, 2),
            'dr_plans': len(self.disaster_recovery_plans),
            'last_backup': self.recovery_points[-1].to_dict() if self.recovery_points else None
        }
    
    def get_plan_stats(self, plan_id: str) -> Dict:
        """获取指定计划的统计"""
        plan = self.get_plan(plan_id)
        if not plan:
            return {}
        
        plan_points = [rp for rp in self.recovery_points if rp.plan_id == plan_id]
        total_size = sum(rp.file_size for rp in plan_points)
        
        return {
            'plan_id': plan_id,
            'plan_name': plan.name,
            'total_backups': len(plan_points),
            'total_size': round(total_size / 1024 / 1024, 2),
            'last_backup': plan_points[-1].to_dict() if plan_points else None,
            'last_run_at': plan.last_run_at,
            'last_status': plan.last_status
        }
    
    def verify_backup(self, recovery_point_id: str) -> Dict:
        """验证备份完整性"""
        recovery_point = self._get_recovery_point(recovery_point_id)
        if not recovery_point:
            return {'valid': False, 'error': '恢复点不存在'}
        
        try:
            # 读取文件并验证校验和
            with open(recovery_point.file_path, 'rb' if recovery_point.file_path.endswith('.gz') else 'r') as f:
                if recovery_point.file_path.endswith('.gz'):
                    data = f.read()
                    current_checksum = hashlib.md5(gzip.decompress(data)).hexdigest()
                else:
                    current_checksum = hashlib.md5(f.read().encode()).hexdigest()
            
            is_valid = current_checksum == recovery_point.checksum
            
            return {
                'valid': is_valid,
                'recovery_point_id': recovery_point_id,
                'expected_checksum': recovery_point.checksum,
                'actual_checksum': current_checksum,
                'verified_at': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'valid': False,
                'recovery_point_id': recovery_point_id,
                'error': str(e)
            }
