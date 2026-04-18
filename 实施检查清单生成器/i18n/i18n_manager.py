#!/usr/bin/env python3
"""
US14: 国际化支持
实现多语言支持（中/英/日/德/法）、时区适配、日期时间本地化和多语言UI切换
"""

import json
import uuid
import os
import re
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, field, asdict
from zoneinfo import ZoneInfo
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Locale(Enum):
    """支持的区域设置"""
    ZH_CN = "zh_CN"    # 简体中文
    EN_US = "en_US"    # 美式英语
    JA_JP = "ja_JP"    # 日语
    DE_DE = "de_DE"    # 德语
    FR_FR = "fr_FR"    # 法语


@dataclass
class TimezoneConfig:
    """时区配置"""
    timezone_id: str               # IANA时区ID
    name: str                      # 显示名称
    utc_offset: str                # UTC偏移
    is_auto_detected: bool = False
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'TimezoneConfig':
        return cls(**data)


@dataclass
class DateTimeFormat:
    """日期时间格式配置"""
    locale: str
    date_format: str = "YYYY-MM-DD"
    time_format: str = "HH:mm:ss"
    datetime_format: str = "YYYY-MM-DD HH:mm:ss"
    short_date_format: str = "MM/DD"
    long_date_format: str = "MMMM DD, YYYY"
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'DateTimeFormat':
        return cls(**data)


class TranslationService:
    """翻译服务"""
    
    # 内置翻译数据
    TRANSLATIONS = {
        "zh_CN": {
            # 通用
            "app.name": "Ariba实施检查清单",
            "app.title": "Ariba实施助手",
            "common.save": "保存",
            "common.cancel": "取消",
            "common.delete": "删除",
            "common.edit": "编辑",
            "common.search": "搜索",
            "common.filter": "筛选",
            "common.export": "导出",
            "common.import": "导入",
            "common.back": "返回",
            "common.next": "下一步",
            "common.confirm": "确认",
            "common.close": "关闭",
            "common.loading": "加载中...",
            "common.success": "操作成功",
            "common.error": "操作失败",
            "common.warning": "警告",
            "common.info": "提示",
            
            # 清单
            "checklist.generate": "生成清单",
            "checklist.template": "模板",
            "checklist.item": "清单项",
            "checklist.phase": "阶段",
            "checklist.module": "模块",
            "checklist.status": "状态",
            "checklist.progress": "进度",
            "checklist.assignee": "负责人",
            "checklist.due_date": "截止日期",
            "checklist.completed": "已完成",
            "checklist.in_progress": "进行中",
            "checklist.blocked": "受阻",
            "checklist.not_started": "未开始",
            "checklist.overdue": "已超期",
            
            # 状态
            "status.pending": "待处理",
            "status.approved": "已批准",
            "status.rejected": "已拒绝",
            "status.completed": "已完成",
            "status.failed": "失败",
            
            # 时间
            "time.today": "今天",
            "time.yesterday": "昨天",
            "time.tomorrow": "明天",
            "time.this_week": "本周",
            "time.this_month": "本月",
            "time.last_week": "上周",
            "time.last_month": "上月",
            
            # 错误消息
            "error.network": "网络错误",
            "error.timeout": "请求超时",
            "error.not_found": "未找到",
            "error.permission": "权限不足",
            "error.validation": "验证失败",
            
            # 菜单
            "menu.home": "首页",
            "menu.dashboard": "仪表盘",
            "menu.checklist": "检查清单",
            "menu.template": "模板管理",
            "menu.analytics": "数据分析",
            "menu.settings": "设置",
            "menu.workflow": "工作流",
            "menu.notification": "通知",
            "menu.backup": "备份",
            "menu.i18n": "语言设置"
        },
        
        "en_US": {
            # General
            "app.name": "Ariba Implementation Checklist",
            "app.title": "Ariba Assistant",
            "common.save": "Save",
            "common.cancel": "Cancel",
            "common.delete": "Delete",
            "common.edit": "Edit",
            "common.search": "Search",
            "common.filter": "Filter",
            "common.export": "Export",
            "common.import": "Import",
            "common.back": "Back",
            "common.next": "Next",
            "common.confirm": "Confirm",
            "common.close": "Close",
            "common.loading": "Loading...",
            "common.success": "Operation successful",
            "common.error": "Operation failed",
            "common.warning": "Warning",
            "common.info": "Information",
            
            # Checklist
            "checklist.generate": "Generate Checklist",
            "checklist.template": "Template",
            "checklist.item": "Item",
            "checklist.phase": "Phase",
            "checklist.module": "Module",
            "checklist.status": "Status",
            "checklist.progress": "Progress",
            "checklist.assignee": "Assignee",
            "checklist.due_date": "Due Date",
            "checklist.completed": "Completed",
            "checklist.in_progress": "In Progress",
            "checklist.blocked": "Blocked",
            "checklist.not_started": "Not Started",
            "checklist.overdue": "Overdue",
            
            # Status
            "status.pending": "Pending",
            "status.approved": "Approved",
            "status.rejected": "Rejected",
            "status.completed": "Completed",
            "status.failed": "Failed",
            
            # Time
            "time.today": "Today",
            "time.yesterday": "Yesterday",
            "time.tomorrow": "Tomorrow",
            "time.this_week": "This Week",
            "time.this_month": "This Month",
            "time.last_week": "Last Week",
            "time.last_month": "Last Month",
            
            # Error messages
            "error.network": "Network error",
            "error.timeout": "Request timeout",
            "error.not_found": "Not found",
            "error.permission": "Permission denied",
            "error.validation": "Validation failed",
            
            # Menu
            "menu.home": "Home",
            "menu.dashboard": "Dashboard",
            "menu.checklist": "Checklist",
            "menu.template": "Templates",
            "menu.analytics": "Analytics",
            "menu.settings": "Settings",
            "menu.workflow": "Workflow",
            "menu.notification": "Notifications",
            "menu.backup": "Backup",
            "menu.i18n": "Language"
        },
        
        "ja_JP": {
            # 共通
            "app.name": "Ariba 實施チェックリスト",
            "app.title": "Ariba アシスタント",
            "common.save": "保存",
            "common.cancel": "キャンセル",
            "common.delete": "削除",
            "common.edit": "編集",
            "common.search": "検索",
            "common.filter": "フィルター",
            "common.export": "エクスポート",
            "common.import": "インポート",
            "common.back": "戻る",
            "common.next": "次へ",
            "common.confirm": "確認",
            "common.close": "閉じる",
            "common.loading": "読み込み中...",
            "common.success": "操作成功",
            "common.error": "操作失敗",
            "common.warning": "警告",
            "common.info": "情報",
            
            # チェックリスト
            "checklist.generate": "チェックリスト生成",
            "checklist.template": "テンプレート",
            "checklist.item": "項目",
            "checklist.phase": "フェーズ",
            "checklist.module": "モジュール",
            "checklist.status": "ステータス",
            "checklist.progress": "進捗",
            "checklist.assignee": "担当者",
            "checklist.due_date": "期限",
            "checklist.completed": "完了",
            "checklist.in_progress": "進行中",
            "checklist.blocked": "ブロック",
            "checklist.not_started": "未着手",
            "checklist.overdue": "期限超過",
            
            # ステータス
            "status.pending": "保留中",
            "status.approved": "承認済み",
            "status.rejected": "却下",
            "status.completed": "完了",
            "status.failed": "失敗",
            
            # 時間
            "time.today": "今日",
            "time.yesterday": "昨日",
            "time.tomorrow": "明日",
            "time.this_week": "今週",
            "time.this_month": "今月",
            "time.last_week": "先週",
            "time.last_month": "先月",
            
            # エラーメッセージ
            "error.network": "ネットワークエラー",
            "error.timeout": "リクエストタイムアウト",
            "error.not_found": "見つかりません",
            "error.permission": "権限がありません",
            "error.validation": "検証失敗",
            
            # メニュー
            "menu.home": "ホーム",
            "menu.dashboard": "ダッシュボード",
            "menu.checklist": "チェックリスト",
            "menu.template": "テンプレート",
            "menu.analytics": "分析",
            "menu.settings": "設定",
            "menu.workflow": "ワークフロー",
            "menu.notification": "通知",
            "menu.backup": "バックアップ",
            "menu.i18n": "言語設定"
        },
        
        "de_DE": {
            # Allgemein
            "app.name": "Ariba Implementierungs-Checkliste",
            "app.title": "Ariba-Assistent",
            "common.save": "Speichern",
            "common.cancel": "Abbrechen",
            "common.delete": "Löschen",
            "common.edit": "Bearbeiten",
            "common.search": "Suchen",
            "common.filter": "Filtern",
            "common.export": "Exportieren",
            "common.import": "Importieren",
            "common.back": "Zurück",
            "common.next": "Weiter",
            "common.confirm": "Bestätigen",
            "common.close": "Schließen",
            "common.loading": "Laden...",
            "common.success": "Erfolgreich",
            "common.error": "Fehlgeschlagen",
            "common.warning": "Warnung",
            "common.info": "Information",
            
            # Checkliste
            "checklist.generate": "Checkliste erstellen",
            "checklist.template": "Vorlage",
            "checklist.item": "Element",
            "checklist.phase": "Phase",
            "checklist.module": "Modul",
            "checklist.status": "Status",
            "checklist.progress": "Fortschritt",
            "checklist.assignee": "Zugewiesen an",
            "checklist.due_date": "Fälligkeitsdatum",
            "checklist.completed": "Abgeschlossen",
            "checklist.in_progress": "In Bearbeitung",
            "checklist.blocked": "Blockiert",
            "checklist.not_started": "Nicht begonnen",
            "checklist.overdue": "Überfällig",
            
            # Status
            "status.pending": "Ausstehend",
            "status.approved": "Genehmigt",
            "status.rejected": "Abgelehnt",
            "status.completed": "Abgeschlossen",
            "status.failed": "Fehlgeschlagen",
            
            # Zeit
            "time.today": "Heute",
            "time.yesterday": "Gestern",
            "time.tomorrow": "Morgen",
            "time.this_week": "Diese Woche",
            "time.this_month": "Dieser Monat",
            "time.last_week": "Letzte Woche",
            "time.last_month": "Letzter Monat",
            
            # Fehlermeldungen
            "error.network": "Netzwerkfehler",
            "error.timeout": "Zeitüberschreitung",
            "error.not_found": "Nicht gefunden",
            "error.permission": "Zugriff verweigert",
            "error.validation": "Validierung fehlgeschlagen",
            
            # Menü
            "menu.home": "Startseite",
            "menu.dashboard": "Dashboard",
            "menu.checklist": "Checkliste",
            "menu.template": "Vorlagen",
            "menu.analytics": "Analytik",
            "menu.settings": "Einstellungen",
            "menu.workflow": "Workflow",
            "menu.notification": "Benachrichtigungen",
            "menu.backup": "Sicherung",
            "menu.i18n": "Sprache"
        },
        
        "fr_FR": {
            # Général
            "app.name": "Liste de contrôle Ariba",
            "app.title": "Assistant Ariba",
            "common.save": "Enregistrer",
            "common.cancel": "Annuler",
            "common.delete": "Supprimer",
            "common.edit": "Modifier",
            "common.search": "Rechercher",
            "common.filter": "Filtrer",
            "common.export": "Exporter",
            "common.import": "Importer",
            "common.back": "Retour",
            "common.next": "Suivant",
            "common.confirm": "Confirmer",
            "common.close": "Fermer",
            "common.loading": "Chargement...",
            "common.success": "Opération réussie",
            "common.error": "Opération échouée",
            "common.warning": "Avertissement",
            "common.info": "Information",
            
            # Liste de contrôle
            "checklist.generate": "Générer la liste",
            "checklist.template": "Modèle",
            "checklist.item": "Élément",
            "checklist.phase": "Phase",
            "checklist.module": "Module",
            "checklist.status": "Statut",
            "checklist.progress": "Progression",
            "checklist.assignee": "Assigné à",
            "checklist.due_date": "Date d'échéance",
            "checklist.completed": "Terminé",
            "checklist.in_progress": "En cours",
            "checklist.blocked": "Bloqué",
            "checklist.not_started": "Non commencé",
            "checklist.overdue": "En retard",
            
            # Statut
            "status.pending": "En attente",
            "status.approved": "Approuvé",
            "status.rejected": "Rejeté",
            "status.completed": "Terminé",
            "status.failed": "Échoué",
            
            # Temps
            "time.today": "Aujourd'hui",
            "time.yesterday": "Hier",
            "time.tomorrow": "Demain",
            "time.this_week": "Cette semaine",
            "time.this_month": "Ce mois",
            "time.last_week": "Semaine dernière",
            "time.last_month": "Mois dernier",
            
            # Messages d'erreur
            "error.network": "Erreur réseau",
            "error.timeout": "Délai dépassé",
            "error.not_found": "Non trouvé",
            "error.permission": "Accès refusé",
            "error.validation": "Échec de validation",
            
            # Menu
            "menu.home": "Accueil",
            "menu.dashboard": "Tableau de bord",
            "menu.checklist": "Liste de contrôle",
            "menu.template": "Modèles",
            "menu.analytics": "Analytique",
            "menu.settings": "Paramètres",
            "menu.workflow": "Flux de travail",
            "menu.notification": "Notifications",
            "menu.backup": "Sauvegarde",
            "menu.i18n": "Langue"
        }
    }
    
    def __init__(self):
        self.current_translations = self.TRANSLATIONS.copy()
    
    def get_translations(self, locale: str) -> Dict[str, str]:
        """获取指定语言的翻译"""
        return self.current_translations.get(locale, self.current_translations.get("en_US", {}))
    
    def translate(self, key: str, locale: str, default: Optional[str] = None) -> str:
        """翻译单个键"""
        translations = self.get_translations(locale)
        return translations.get(key, default or key)
    
    def add_translation(self, locale: str, key: str, value: str):
        """添加翻译"""
        if locale not in self.current_translations:
            self.current_translations[locale] = {}
        self.current_translations[locale][key] = value
    
    def update_translations(self, locale: str, translations: Dict[str, str]):
        """批量更新翻译"""
        if locale not in self.current_translations:
            self.current_translations[locale] = {}
        self.current_translations[locale].update(translations)


class I18nManager:
    """
    国际化管理器
    支持5种语言、时区适配、日期时间本地化、多语言UI切换
    """
    
    # 支持的语言列表
    SUPPORTED_LOCALES = [
        {"code": "zh_CN", "name": "简体中文", "native_name": "简体中文", "flag": "🇨🇳"},
        {"code": "en_US", "name": "English (US)", "native_name": "English", "flag": "🇺🇸"},
        {"code": "ja_JP", "name": "Japanese", "native_name": "日本語", "flag": "🇯🇵"},
        {"code": "de_DE", "name": "German", "native_name": "Deutsch", "flag": "🇩🇪"},
        {"code": "fr_FR", "name": "French", "native_name": "Français", "flag": "🇫🇷"}
    ]
    
    # 常用时区列表
    COMMON_TIMEZONES = [
        {"id": "Asia/Shanghai", "name": "中国标准时间", "offset": "+08:00"},
        {"id": "America/New_York", "name": "美东时间", "offset": "-05:00"},
        {"id": "America/Los_Angeles", "name": "美西时间", "offset": "-08:00"},
        {"id": "Europe/London", "name": "格林威治时间", "offset": "+00:00"},
        {"id": "Europe/Paris", "name": "中欧时间", "offset": "+01:00"},
        {"id": "Europe/Berlin", "name": "柏林时间", "offset": "+01:00"},
        {"id": "Asia/Tokyo", "name": "日本标准时间", "offset": "+09:00"},
        {"id": "Asia/Singapore", "name": "新加坡时间", "offset": "+08:00"},
        {"id": "Australia/Sydney", "name": "悉尼时间", "offset": "+10:00"},
        {"id": "UTC", "name": "UTC", "offset": "+00:00"}
    ]
    
    # 日期时间格式配置
    DATETIME_FORMATS = {
        "zh_CN": DateTimeFormat(
            locale="zh_CN",
            date_format="YYYY年MM月DD日",
            time_format="HH:mm:ss",
            datetime_format="YYYY年MM月DD日 HH:mm",
            short_date_format="MM/DD",
            long_date_format="YYYY年MM月DD日"
        ),
        "en_US": DateTimeFormat(
            locale="en_US",
            date_format="MM/DD/YYYY",
            time_format="h:mm:ss A",
            datetime_format="MM/DD/YYYY h:mm A",
            short_date_format="MM/DD",
            long_date_format="MMMM DD, YYYY"
        ),
        "ja_JP": DateTimeFormat(
            locale="ja_JP",
            date_format="YYYY年MM月DD日",
            time_format="HH:mm:ss",
            datetime_format="YYYY年MM月DD日 HH:mm",
            short_date_format="MM/DD",
            long_date_format="YYYY年MM月DD日"
        ),
        "de_DE": DateTimeFormat(
            locale="de_DE",
            date_format="DD.MM.YYYY",
            time_format="HH:mm:ss",
            datetime_format="DD.MM.YYYY HH:mm",
            short_date_format="DD.MM",
            long_date_format="DD. MMMM YYYY"
        ),
        "fr_FR": DateTimeFormat(
            locale="fr_FR",
            date_format="DD/MM/YYYY",
            time_format="HH:mm:ss",
            datetime_format="DD/MM/YYYY HH:mm",
            short_date_format="DD/MM",
            long_date_format="DD MMMM YYYY"
        )
    }
    
    def __init__(self, storage_path: Optional[str] = None):
        """初始化国际化管理器"""
        self.storage_path = storage_path
        self.current_locale = Locale.EN_US.value
        self.current_timezone = "Asia/Shanghai"
        self.user_preferences: Dict[str, Any] = {}
        self.translation_service = TranslationService()
        self._cache: Dict[str, Any] = {}
        
        # 加载用户偏好
        self._load_preferences()
    
    def _load_preferences(self):
        """加载用户偏好"""
        if not self.storage_path:
            return
        
        try:
            os.makedirs(self.storage_path, exist_ok=True)
            with open(f"{self.storage_path}/i18n_preferences.json", 'r') as f:
                prefs = json.load(f)
                self.current_locale = prefs.get('locale', Locale.EN_US.value)
                self.current_timezone = prefs.get('timezone', "Asia/Shanghai")
                self.user_preferences = prefs
        except FileNotFoundError:
            pass
    
    def _save_preferences(self):
        """保存用户偏好"""
        if not self.storage_path:
            return
        
        os.makedirs(self.storage_path, exist_ok=True)
        self.user_preferences['locale'] = self.current_locale
        self.user_preferences['timezone'] = self.current_timezone
        
        with open(f"{self.storage_path}/i18n_preferences.json", 'w') as f:
            json.dump(self.user_preferences, f, indent=2)
    
    # ==================== 语言切换 ====================
    
    def set_locale(self, locale: str) -> bool:
        """设置当前语言"""
        if locale in [l["code"] for l in self.SUPPORTED_LOCALES]:
            self.current_locale = locale
            self._cache.clear()  # 清除缓存
            self._save_preferences()
            logger.info(f"语言切换: {locale}")
            return True
        return False
    
    def get_locale(self) -> str:
        """获取当前语言"""
        return self.current_locale
    
    def get_supported_locales(self) -> List[Dict]:
        """获取支持的语言列表"""
        return self.SUPPORTED_LOCALES
    
    def detect_locale_from_browser(self) -> str:
        """从浏览器自动检测语言"""
        import locale as sys_locale
        try:
            detected = sys_locale.getdefaultlocale()[0]
            if detected:
                # 映射到支持的语言
                mapping = {
                    'zh': 'zh_CN',
                    'zh_CN': 'zh_CN',
                    'en': 'en_US',
                    'ja': 'ja_JP',
                    'de': 'de_DE',
                    'fr': 'fr_FR'
                }
                lang = detected.split('_')[0].lower()
                return mapping.get(lang, 'en_US')
        except:
            pass
        return 'en_US'
    
    def detect_timezone_from_browser(self) -> str:
        """从浏览器自动检测时区"""
        return "Asia/Shanghai"  # 需要前端传入
    
    # ==================== 翻译 ====================
    
    def t(self, key: str, default: Optional[str] = None) -> str:
        """翻译键值"""
        # 先检查缓存
        cache_key = f"{self.current_locale}:{key}"
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        result = self.translation_service.translate(
            key, self.current_locale, default
        )
        
        self._cache[cache_key] = result
        return result
    
    def t_plural(self, key: str, count: int) -> str:
        """复数形式翻译"""
        if count == 1:
            return self.t(key)
        else:
            plural_key = f"{key}_plural"
            return self.t(plural_key, self.t(key))
    
    def translate_batch(self, keys: List[str]) -> Dict[str, str]:
        """批量翻译"""
        return {key: self.t(key) for key in keys}
    
    # ==================== 时区处理 ====================
    
    def set_timezone(self, timezone_id: str) -> bool:
        """设置时区"""
        if timezone_id in [tz["id"] for tz in self.COMMON_TIMEZONES]:
            self.current_timezone = timezone_id
            self._save_preferences()
            logger.info(f"时区切换: {timezone_id}")
            return True
        return False
    
    def get_timezone(self) -> str:
        """获取当前时区"""
        return self.current_timezone
    
    def get_supported_timezones(self) -> List[Dict]:
        """获取支持的时区列表"""
        return self.COMMON_TIMEZONES
    
    def get_timezone_offset(self, timezone_id: Optional[str] = None) -> str:
        """获取时区偏移"""
        tz_id = timezone_id or self.current_timezone
        for tz in self.COMMON_TIMEZONES:
            if tz["id"] == tz_id:
                return tz["offset"]
        return "+00:00"
    
    def convert_timezone(
        self,
        dt: datetime,
        from_tz: Optional[str] = None,
        to_tz: Optional[str] = None
    ) -> datetime:
        """转换时区"""
        from_timezone = ZoneInfo(from_tz or self.current_timezone)
        to_timezone = ZoneInfo(to_tz or self.current_timezone)
        
        # 将时间转换为目标时区
        localized_dt = dt.replace(tzinfo=from_timezone)
        return localized_dt.astimezone(to_timezone)
    
    def get_current_time(self) -> datetime:
        """获取当前时间（指定时区）"""
        return datetime.now(ZoneInfo(self.current_timezone))
    
    # ==================== 日期时间格式化 ====================
    
    def get_datetime_format(self, locale: Optional[str] = None) -> DateTimeFormat:
        """获取日期时间格式配置"""
        loc = locale or self.current_locale
        return self.DATETIME_FORMATS.get(loc, self.DATETIME_FORMATS["en_US"])
    
    def format_date(
        self,
        dt: datetime,
        format_type: str = "default",
        locale: Optional[str] = None
    ) -> str:
        """格式化日期"""
        fmt = self.get_datetime_format(locale)
        
        if format_type == "short":
            pattern = fmt.short_date_format
        elif format_type == "long":
            pattern = fmt.long_date_format
        else:
            pattern = fmt.date_format
        
        return self._apply_date_pattern(dt, pattern)
    
    def format_time(
        self,
        dt: datetime,
        locale: Optional[str] = None
    ) -> str:
        """格式化时间"""
        fmt = self.get_datetime_format(locale)
        return self._apply_date_pattern(dt, fmt.time_format)
    
    def format_datetime(
        self,
        dt: datetime,
        locale: Optional[str] = None
    ) -> str:
        """格式化日期时间"""
        fmt = self.get_datetime_format(locale)
        return self._apply_date_pattern(dt, fmt.datetime_format)
    
    def _apply_date_pattern(self, dt: datetime, pattern: str) -> str:
        """应用日期格式模式"""
        result = pattern
        
        # 年
        result = result.replace("YYYY", str(dt.year))
        result = result.replace("YY", str(dt.year)[-2:])
        
        # 月
        result = result.replace("MMMM", self._get_month_name(dt.month, self.current_locale))
        result = result.replace("MMM", self._get_month_name(dt.month, self.current_locale, short=True))
        result = result.replace("MM", f"{dt.month:02d}")
        
        # 日
        result = result.replace("DDDD", str(dt.day))
        result = result.replace("DD", f"{dt.day:02d}")
        
        # 时
        hour_24 = dt.hour
        hour_12 = hour_24 % 12 or 12
        result = result.replace("HH", f"{hour_24:02d}")
        result = result.replace("hh", f"{hour_12:02d}")
        result = result.replace("A", "AM" if hour_24 < 12 else "PM")
        
        # 分秒
        result = result.replace("mm", f"{dt.minute:02d}")
        result = result.replace("ss", f"{dt.second:02d}")
        
        return result
    
    def _get_month_name(self, month: int, locale: str, short: bool = False) -> str:
        """获取月份名称"""
        month_names = {
            "zh_CN": {
                1: "一月" if short else "一月",
                2: "二月" if short else "二月",
                3: "三月" if short else "三月",
                4: "四月" if short else "四月",
                5: "五月" if short else "五月",
                6: "六月" if short else "六月",
                7: "七月" if short else "七月",
                8: "八月" if short else "八月",
                9: "九月" if short else "九月",
                10: "十月" if short else "十月",
                11: "十一月" if short else "十一月",
                12: "十二月" if short else "十二月"
            },
            "en_US": {
                1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr",
                5: "May", 6: "Jun", 7: "Jul", 8: "Aug",
                9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"
            },
            "ja_JP": {
                1: "1月", 2: "2月", 3: "3月", 4: "4月",
                5: "5月", 6: "6月", 7: "7月", 8: "8月",
                9: "9月", 10: "10月", 11: "11月", 12: "12月"
            },
            "de_DE": {
                1: "Jan", 2: "Feb", 3: "Mär", 4: "Apr",
                5: "Mai", 6: "Jun", 7: "Jul", 8: "Aug",
                9: "Sep", 10: "Okt", 11: "Nov", 12: "Dez"
            },
            "fr_FR": {
                1: "Jan", 2: "Fév", 3: "Mar", 4: "Avr",
                5: "Mai", 6: "Juin", 7: "Juil", 8: "Août",
                9: "Sep", 10: "Oct", 11: "Nov", 12: "Déc"
            }
        }
        
        names = month_names.get(locale, month_names["en_US"])
        return names.get(month, str(month))
    
    # ==================== 相对时间 ====================
    
    def format_relative_time(
        self,
        dt: datetime,
        locale: Optional[str] = None
    ) -> str:
        """格式化相对时间"""
        loc = locale or self.current_locale
        now = datetime.now()
        diff = now - dt
        
        seconds = diff.total_seconds()
        
        if seconds < 60:
            return self._t("time.just_now", loc)
        elif seconds < 3600:
            minutes = int(seconds / 60)
            return self._t("time.minutes_ago", loc).format(minutes)
        elif seconds < 86400:
            hours = int(seconds / 3600)
            return self._t("time.hours_ago", loc).format(hours)
        elif seconds < 172800:
            return self._t("time.yesterday", loc)
        else:
            days = int(seconds / 86400)
            return self._t("time.days_ago", loc).format(days)
    
    def _t(self, key: str, locale: str) -> str:
        """翻译相对时间模板"""
        templates = {
            "zh_CN": {
                "time.just_now": "刚刚",
                "time.minutes_ago": "{0}分钟前",
                "time.hours_ago": "{0}小时前",
                "time.yesterday": "昨天",
                "time.days_ago": "{0}天前"
            },
            "en_US": {
                "time.just_now": "just now",
                "time.minutes_ago": "{0} minutes ago",
                "time.hours_ago": "{0} hours ago",
                "time.yesterday": "yesterday",
                "time.days_ago": "{0} days ago"
            }
        }
        
        locale_templates = templates.get(locale, templates["en_US"])
        return locale_templates.get(key, key)
    
    # ==================== 数字格式化 ====================
    
    def format_number(
        self,
        number: float,
        decimals: int = 2,
        locale: Optional[str] = None
    ) -> str:
        """格式化数字"""
        loc = locale or self.current_locale
        
        if loc == "zh_CN":
            return f"{number:,.{decimals}f}".replace(",", ",")
        elif loc in ["de_DE", "fr_FR"]:
            return f"{number:,.{decimals}f}".replace(",", "X").replace(".", ",").replace("X", ".")
        else:
            return f"{number:,.{decimals}f}"
    
    def format_currency(
        self,
        amount: float,
        currency: str = "CNY",
        locale: Optional[str] = None
    ) -> str:
        """格式化货币"""
        loc = locale or self.current_locale
        
        currency_symbols = {
            "CNY": "¥",
            "USD": "$",
            "EUR": "€",
            "JPY": "¥",
            "GBP": "£"
        }
        
        symbol = currency_symbols.get(currency, currency)
        formatted = self.format_number(amount, 2, loc)
        
        return f"{symbol}{formatted}"
    
    # ==================== 偏好管理 ====================
    
    def get_user_preferences(self) -> Dict[str, Any]:
        """获取用户偏好"""
        return {
            'locale': self.current_locale,
            'timezone': self.current_timezone,
            'date_format': self.get_datetime_format().date_format,
            'time_format': self.get_datetime_format().time_format
        }
    
    def update_user_preferences(self, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """更新用户偏好"""
        if 'locale' in preferences:
            self.set_locale(preferences['locale'])
        if 'timezone' in preferences:
            self.set_timezone(preferences['timezone'])
        
        self.user_preferences.update(preferences)
        self._save_preferences()
        
        return self.get_user_preferences()
    
    # ==================== 导出 ====================
    
    def export_translations(self, locale: str) -> Dict[str, str]:
        """导出指定语言的翻译"""
        return self.translation_service.get_translations(locale)
    
    def export_all_translations(self) -> Dict[str, Dict[str, str]]:
        """导出所有语言的翻译"""
        return self.translation_service.current_translations
    
    def import_translations(self, locale: str, translations: Dict[str, str]):
        """导入翻译"""
        self.translation_service.update_translations(locale, translations)
        self._cache.clear()
