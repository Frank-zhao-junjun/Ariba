#!/bin/bash
# Ariba实施助手 v1.7.0 API测试脚本

BASE_URL="http://localhost:3001/api/requirement"
SESSION_ID=""

echo "=========================================="
echo "Ariba实施助手 v1.7.0 API测试"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_api() {
    local name=$1
    local url=$2
    local method=$3
    local data=$4
    
    echo -e "${YELLOW}测试: ${name}${NC}"
    echo "URL: ${method} ${url}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "${url}")
    else
        response=$(curl -s -w "\n%{http_code}" -X "${method}" -H "Content-Type: application/json" -d "${data}" "${url}")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        success=$(echo "$body" | grep -o '"success":[^,}]*' | head -1 | grep 'true')
        if [ -n "$success" ]; then
            echo -e "${GREEN}✓ 通过${NC}"
            echo "$body" | head -c 500
            if [ ${#body} -gt 500 ]; then echo "..."; fi
        else
            echo -e "${RED}✗ 失败 - 返回错误${NC}"
            echo "$body"
        fi
    else
        echo -e "${RED}✗ 失败 - HTTP ${http_code}${NC}"
    fi
    echo ""
    echo "----------------------------------------"
    echo ""
}

# 测试1: 访谈开始
echo "=== 1. RA-F01: 引导式访谈 - 开始访谈 ==="
response=$(curl -s -X POST "${BASE_URL}/interview/start" \
    -H "Content-Type: application/json" \
    -d '{"industry": "制造业", "modules": "采购管理", "projectId": "TEST001"}')
SESSION_ID=$(echo "$response" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
echo "会话ID: $SESSION_ID"
echo "$response" | head -c 300
echo ""
echo ""

# 测试2: 访谈下一问题
if [ -n "$SESSION_ID" ]; then
    echo "=== 2. RA-F01: 引导式访谈 - 下一问题 ==="
    curl -s -X POST "${BASE_URL}/interview/next" \
        -H "Content-Type: application/json" \
        -d "{\"sessionId\": \"$SESSION_ID\", \"answer\": \"年采购额5亿元\"}" | head -c 300
    echo ""
    echo ""
fi

# 测试3: 访谈状态
if [ -n "$SESSION_ID" ]; then
    echo "=== 3. RA-F01: 引导式访谈 - 获取状态 ==="
    curl -s "${BASE_URL}/interview/$SESSION_ID" | head -c 300
    echo ""
    echo ""
fi

# 测试4: 访谈模板
echo "=== 4. RA-F01: 引导式访谈 - 获取模板 ==="
curl -s "${BASE_URL}/interview/questions/template" | head -c 300
echo ""
echo ""

# 测试5: 能力匹配
echo "=== 5. RA-F02: Ariba能力匹配 ==="
curl -s -X POST "${BASE_URL}/match" \
    -H "Content-Type: application/json" \
    -d '{
        "requirements": [
            {"id": "REQ001", "name": "采购申请管理", "description": "支持采购申请的创建、审批"},
            {"id": "REQ002", "name": "S/4HANA集成", "description": "与SAP S/4HANA进行数据同步"}
        ]
    }' | head -c 400
echo ""
echo ""

# 测试6: 用户故事生成
echo "=== 6. RA-F04: 用户故事生成 ==="
curl -s -X POST "${BASE_URL}/user-stories" \
    -H "Content-Type: application/json" \
    -d '{
        "requirements": [
            {"id": "REQ001", "name": "采购申请管理", "description": "支持采购申请的创建和审批", "priority": "P0"}
        ],
        "industry": "制造业"
    }' | head -c 400
echo ""
echo ""

# 测试7: 优先级评估增强
echo "=== 7. RA-F05: 优先级评估增强 (RICE + KANO) ==="
curl -s -X POST "${BASE_URL}/priority" \
    -H "Content-Type: application/json" \
    -d '{
        "requirements": [
            {"id": "REQ001", "name": "采购申请", "reach": 9, "impact": 8, "confidence": 9, "effort": 3},
            {"id": "REQ002", "name": "S/4HANA集成", "reach": 5, "impact": 7, "confidence": 6, "effort": 8}
        ]
    }' | head -c 500
echo ""
echo ""

# 测试8: 周边能力识别
echo "=== 8. RA-F06: 周边能力识别 ==="
curl -s -X POST "${BASE_URL}/peripheral" \
    -H "Content-Type: application/json" \
    -d '{
        "requirements": [
            {"id": "REQ001", "name": "采购申请", "description": "支持采购申请的创建和审批"},
            {"id": "REQ002", "name": "UI定制", "description": "需要定制开发界面"}
        ]
    }' | head -c 400
echo ""
echo ""

echo "=========================================="
echo "测试完成"
echo "=========================================="
