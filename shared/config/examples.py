"""
配置管理使用示例
展示如何使用配置管理系统
"""

from shared.config import (
    ConfigManager,
    ConfigSchema,
    ConfigLoader,
    EnvironmentAdapter,
    ConfigValidator,
    ConfigHotReloader,
    get_config_manager,
    config,
    set_config,
    load_config,
    get_troubleshooting_schema,
    get_checklist_schema,
)


# ===== 示例1: 基本使用 =====

def basic_usage():
    """基本使用示例"""
    # 获取配置管理器
    cm = get_config_manager()
    
    # 设置值
    cm.set("database.host", "localhost")
    cm.set("database.port", 5432)
    
    # 获取值
    host = cm.get("database.host")
    port = cm.get("database.port", 3306)  # 带默认值
    
    # 批量设置
    cm.load_defaults({
        "cache.enabled": True,
        "cache.ttl": 3600,
    })
    
    print(f"Database: {host}:{port}")


# ===== 示例2: 配置文件加载 =====

def load_config_file():
    """加载配置文件示例"""
    cm = ConfigManager()
    
    # 加载YAML配置
    cm.load_from_file("config/app.yaml")
    
    # 加载JSON配置
    cm.load_from_file("config/database.json")
    
    # 从环境变量加载
    cm.load_from_env()
    
    # 组合使用
    config_data = cm.get_all()
    print(config_data)


# ===== 示例3: 配置验证 =====

def validate_config():
    """配置验证示例"""
    cm = ConfigManager()
    
    # 添加Schema
    cm.add_schema("app", get_troubleshooting_schema())
    cm.add_schema("checklist", get_checklist_schema())
    
    # 设置值
    cm.set("max_results", 50)
    cm.set("similarity_threshold", 0.8)
    
    # 验证
    valid, errors = cm.validate("app")
    
    if not valid:
        print("Configuration errors:")
        for error in errors:
            print(f"  - {error}")


# ===== 示例4: 热更新 =====

def hot_reload_config():
    """热更新示例"""
    cm = ConfigManager()
    reloader = ConfigHotReloader(cm)
    
    # 添加变更回调
    def on_config_change(path, new_config):
        print(f"Config file {path} changed!")
        cm.reload()
    
    # 监视配置文件
    reloader.watch_file("config/app.yaml", callback=on_config_change)
    
    # 启动监视
    reloader.start()
    
    # ... 应用运行中 ...
    
    # 停止监视
    # reloader.stop()


# ===== 示例5: 环境适配 =====

def environment_adapter():
    """环境适配示例"""
    # 获取当前环境
    env = EnvironmentAdapter.get_environment()
    print(f"Current environment: {env}")
    
    # 获取环境特定配置
    env_config = EnvironmentAdapter.get_env_config()
    print(env_config)
    
    # 获取Profile配置
    profile_config = EnvironmentAdapter.get_profile_config("docker")
    print(profile_config)


# ===== 示例6: 配置Schema定义 =====

def custom_schema():
    """自定义Schema示例"""
    schema = ConfigSchema()
    
    schema.add_field(
        "api_key",
        str,
        required=True,
        description="API密钥"
    )
    
    schema.add_field(
        "timeout",
        int,
        default=30,
        description="请求超时(秒)",
        validator=lambda v: 0 < v < 300
    )
    
    schema.add_field(
        "retry_count",
        int,
        default=3,
        choices=[0, 1, 2, 3, 5]
    )
    
    # 验证
    test_config = {
        "api_key": "secret123",
        "timeout": 60,
        "retry_count": 2
    }
    
    valid, errors = schema.validate(test_config)
    print(f"Valid: {valid}")
    if errors:
        print(f"Errors: {errors}")


# ===== 示例7: 多源配置加载 =====

def multi_source_config():
    """多源配置示例"""
    loader = ConfigLoader()
    
    # 添加搜索路径
    loader.search_paths = [
        Path("./config"),
        Path("/etc/ariba"),
        Path.home() / ".config" / "ariba",
    ]
    
    # 设置环境变量前缀
    loader.env_prefix = "MYAPP_"
    
    # 加载配置
    config = loader.load("app")
    
    print(config)


# ===== 示例8: 配置变更检测 =====

def change_detection():
    """变更检测示例"""
    from shared.config.validation import ConfigChangeDetector
    
    detector = ConfigChangeDetector()
    
    # 初始配置
    initial = {"debug": True, "cache": False, "max": 100}
    detector.take_snapshot("app", initial)
    
    # 模拟配置变更
    updated = {"debug": False, "cache": True, "max": 200}
    changes = detector.detect_changes("app", updated)
    
    print(f"Changes: {changes}")
    
    # 获取历史
    history = detector.get_history("app")
    print(f"History: {len(history)} snapshots")
    
    # 回滚
    rollback_config = detector.rollback("app")
    print(f"Rollback: {rollback_config}")


# ===== 示例9: 快捷函数 =====

def shortcut_functions():
    """快捷函数示例"""
    # 设置
    set_config("app.name", "Ariba Assistant")
    set_config("app.debug", True)
    
    # 获取
    name = config("app.name", "Default")
    debug = config("app.debug", False)
    
    # 批量加载
    load_config("config/production.yaml")


# ===== 示例10: 完整应用示例 =====

def full_application_example():
    """完整应用示例"""
    from shared.config import (
        ConfigManager,
        ConfigSchema,
        EnvironmentAdapter,
        ConfigValidator,
    )
    
    # 1. 创建配置管理器
    cm = ConfigManager()
    
    # 2. 设置环境前缀
    cm.set_env_prefix("ARIBAS_")
    
    # 3. 定义Schema
    schema = ConfigSchema()
    schema.add_field("host", str, default="localhost")
    schema.add_field("port", int, default=8080)
    schema.add_field("debug", bool, default=False)
    cm.add_schema("server", schema)
    
    # 4. 加载配置
    cm.load_defaults({
        "server.host": "0.0.0.0",
        "server.port": 8000,
        "server.debug": False,
    })
    
    # 从文件加载
    cm.load_from_file("config/server.yaml")
    
    # 从环境变量加载
    cm.load_from_env()
    
    # 5. 添加变更监听
    def on_change(key, value):
        print(f"Config changed: {key} = {value}")
    
    cm.add_listener(on_change)
    
    # 6. 验证配置
    valid, errors = cm.validate()
    if not valid:
        print(f"Validation errors: {errors}")
        return
    
    # 7. 使用配置
    host = cm.get("server.host")
    port = cm.get("server.port")
    print(f"Starting server on {host}:{port}")
    
    # 8. 运行时更新
    cm.set("server.debug", True)
    
    return cm


# 运行示例
if __name__ == "__main__":
    print("=" * 50)
    print("Basic Usage")
    print("=" * 50)
    basic_usage()
    
    print("\n" + "=" * 50)
    print("Environment Adapter")
    print("=" * 50)
    environment_adapter()
    
    print("\n" + "=" * 50)
    print("Custom Schema")
    print("=" * 50)
    custom_schema()
