(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/workspace/projects/src/components/ui/card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardAction",
    ()=>CardAction,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardFooter",
    ()=>CardFooter,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.6_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/src/lib/utils.ts [app-client] (ecmascript)");
;
;
function Card({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-inspector-line": "7",
        "data-inspector-column": "4",
        "data-inspector-relative-path": "src/components/ui/card.tsx",
        "data-slot": "card",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/workspace/projects/src/components/ui/card.tsx",
        lineNumber: 7,
        columnNumber: 10
    }, this);
}
_c = Card;
function CardHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-inspector-line": "20",
        "data-inspector-column": "4",
        "data-inspector-relative-path": "src/components/ui/card.tsx",
        "data-slot": "card-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/workspace/projects/src/components/ui/card.tsx",
        lineNumber: 13,
        columnNumber: 10
    }, this);
}
_c1 = CardHeader;
function CardTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-inspector-line": "33",
        "data-inspector-column": "4",
        "data-inspector-relative-path": "src/components/ui/card.tsx",
        "data-slot": "card-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("leading-none font-semibold", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/workspace/projects/src/components/ui/card.tsx",
        lineNumber: 19,
        columnNumber: 10
    }, this);
}
_c2 = CardTitle;
function CardDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-inspector-line": "43",
        "data-inspector-column": "4",
        "data-inspector-relative-path": "src/components/ui/card.tsx",
        "data-slot": "card-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground text-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/workspace/projects/src/components/ui/card.tsx",
        lineNumber: 25,
        columnNumber: 10
    }, this);
}
_c3 = CardDescription;
function CardAction({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-inspector-line": "53",
        "data-inspector-column": "4",
        "data-inspector-relative-path": "src/components/ui/card.tsx",
        "data-slot": "card-action",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/workspace/projects/src/components/ui/card.tsx",
        lineNumber: 31,
        columnNumber: 10
    }, this);
}
_c4 = CardAction;
function CardContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-inspector-line": "66",
        "data-inspector-column": "4",
        "data-inspector-relative-path": "src/components/ui/card.tsx",
        "data-slot": "card-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/workspace/projects/src/components/ui/card.tsx",
        lineNumber: 37,
        columnNumber: 10
    }, this);
}
_c5 = CardContent;
function CardFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-inspector-line": "76",
        "data-inspector-column": "4",
        "data-inspector-relative-path": "src/components/ui/card.tsx",
        "data-slot": "card-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex items-center px-6 [.border-t]:pt-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/workspace/projects/src/components/ui/card.tsx",
        lineNumber: 43,
        columnNumber: 10
    }, this);
}
_c6 = CardFooter;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6;
__turbopack_context__.k.register(_c, "Card");
__turbopack_context__.k.register(_c1, "CardHeader");
__turbopack_context__.k.register(_c2, "CardTitle");
__turbopack_context__.k.register(_c3, "CardDescription");
__turbopack_context__.k.register(_c4, "CardAction");
__turbopack_context__.k.register(_c5, "CardContent");
__turbopack_context__.k.register(_c6, "CardFooter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/workspace/projects/src/components/ui/select.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Select",
    ()=>Select,
    "SelectContent",
    ()=>SelectContent,
    "SelectGroup",
    ()=>SelectGroup,
    "SelectItem",
    ()=>SelectItem,
    "SelectLabel",
    ()=>SelectLabel,
    "SelectScrollDownButton",
    ()=>SelectScrollDownButton,
    "SelectScrollUpButton",
    ()=>SelectScrollUpButton,
    "SelectSeparator",
    ()=>SelectSeparator,
    "SelectTrigger",
    ()=>SelectTrigger,
    "SelectValue",
    ()=>SelectValue
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.6_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$10_$5f40$types$2b$react$40$19$2e$2$2e$_ev5zajhol2oflkpl4apxvfxu44$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/@radix-ui+react-select@2.2.6_@types+react-dom@19.2.3_@types+react@19.2.10__@types+react@19.2._ev5zajhol2oflkpl4apxvfxu44/node_modules/@radix-ui/react-select/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckIcon$3e$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/lucide-react@0.468.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as CheckIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/lucide-react@0.468.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDownIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUpIcon$3e$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/lucide-react@0.468.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-client] (ecmascript) <export default as ChevronUpIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
function Select({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$10_$5f40$types$2b$react$40$19$2e$2$2e$_ev5zajhol2oflkpl4apxvfxu44$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-inspector-line": "12",
        "data-inspector-column": "9",
        "data-inspector-relative-path": "src/components/ui/select.tsx",
        "data-slot": "select",
        ...props
    }, void 0, false, {
        fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
        lineNumber: 10,
        columnNumber: 10
    }, this);
}
_c = Select;
function SelectGroup({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$10_$5f40$types$2b$react$40$19$2e$2$2e$_ev5zajhol2oflkpl4apxvfxu44$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"], {
        "data-inspector-line": "18",
        "data-inspector-column": "9",
        "data-inspector-relative-path": "src/components/ui/select.tsx",
        "data-slot": "select-group",
        ...props
    }, void 0, false, {
        fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
        lineNumber: 15,
        columnNumber: 10
    }, this);
}
_c1 = SelectGroup;
function SelectValue({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$10_$5f40$types$2b$react$40$19$2e$2$2e$_ev5zajhol2oflkpl4apxvfxu44$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Value"], {
        "data-inspector-line": "24",
        "data-inspector-column": "9",
        "data-inspector-relative-path": "src/components/ui/select.tsx",
        "data-slot": "select-value",
        ...props
    }, void 0, false, {
        fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
        lineNumber: 20,
        columnNumber: 10
    }, this);
}
_c2 = SelectValue;
function SelectTrigger({ className, size = "default", children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$10_$5f40$types$2b$react$40$19$2e$2$2e$_ev5zajhol2oflkpl4apxvfxu44$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        "data-inspector-line": "36",
        "data-inspector-column": "4",
        "data-inspector-relative-path": "src/components/ui/select.tsx",
        "data-slot": "select-trigger",
        "data-size": size,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
        ...props,
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$10_$5f40$types$2b$react$40$19$2e$2$2e$_ev5zajhol2oflkpl4apxvfxu44$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                "data-inspector-line": "46",
                "data-inspector-column": "6",
                "data-inspector-relative-path": "src/components/ui/select.tsx",
                asChild: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                    "data-inspector-line": "47",
                    "data-inspector-column": "8",
                    "data-inspector-relative-path": "src/components/ui/select.tsx",
                    className: "size-4 opacity-50"
                }, void 0, false, {
                    fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
        lineNumber: 30,
        columnNumber: 10
    }, this);
}
_c3 = SelectTrigger;
function SelectContent({ className, children, position = "item-aligned", align = "center", ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$10_$5f40$types$2b$react$40$19$2e$2$2e$_ev5zajhol2oflkpl4apxvfxu44$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        "data-inspector-line": "61",
        "data-inspector-column": "4",
        "data-inspector-relative-path": "src/components/ui/select.tsx",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$10_$5f40$types$2b$react$40$19$2e$2$2e$_ev5zajhol2oflkpl4apxvfxu44$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
            "data-inspector-line": "62",
            "data-inspector-column": "6",
            "data-inspector-relative-path": "src/components/ui/select.tsx",
            "data-slot": "select-content",
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
            position: position,
            align: align,
            ...props,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SelectScrollUpButton, {
                    "data-inspector-line": "74",
                    "data-inspector-column": "8",
                    "data-inspector-relative-path": "src/components/ui/select.tsx"
                }, void 0, false, {
                    fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
                    lineNumber: 46,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$10_$5f40$types$2b$react$40$19$2e$2$2e$_ev5zajhol2oflkpl4apxvfxu44$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Viewport"], {
                    "data-inspector-line": "75",
                    "data-inspector-column": "8",
                    "data-inspector-relative-path": "src/components/ui/select.tsx",
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
                    children: children
                }, void 0, false, {
                    fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
                    lineNumber: 47,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SelectScrollDownButton, {
                    "data-inspector-line": "84",
                    "data-inspector-column": "8",
                    "data-inspector-relative-path": "src/components/ui/select.tsx"
                }, void 0, false, {
                    fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
                    lineNumber: 50,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
            lineNumber: 45,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
        lineNumber: 44,
        columnNumber: 10
    }, this);
}
_c4 = SelectContent;
function SelectLabel({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$10_$5f40$types$2b$react$40$19$2e$2$2e$_ev5zajhol2oflkpl4apxvfxu44$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
        "data-inspector-line": "95",
        "data-inspector-column": "4",
        "data-inspector-relative-path": "src/components/ui/select.tsx",
        "data-slot": "select-label",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground px-2 py-1.5 text-xs", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
        lineNumber: 58,
        columnNumber: 10
    }, this);
}
_c5 = SelectLabel;
function SelectItem({ className, children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$10_$5f40$types$2b$react$40$19$2e$2$2e$_ev5zajhol2oflkpl4apxvfxu44$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Item"], {
        "data-inspector-line": "109",
        "data-inspector-column": "4",
        "data-inspector-relative-path": "src/components/ui/select.tsx",
        "data-slot": "select-item",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                "data-inspector-line": "117",
                "data-inspector-column": "6",
                "data-inspector-relative-path": "src/components/ui/select.tsx",
                "data-slot": "select-item-indicator",
                className: "absolute right-2 flex size-3.5 items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$10_$5f40$types$2b$react$40$19$2e$2$2e$_ev5zajhol2oflkpl4apxvfxu44$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ItemIndicator"], {
                    "data-inspector-line": "121",
                    "data-inspector-column": "8",
                    "data-inspector-relative-path": "src/components/ui/select.tsx",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckIcon$3e$__["CheckIcon"], {
                        "data-inspector-line": "122",
                        "data-inspector-column": "10",
                        "data-inspector-relative-path": "src/components/ui/select.tsx",
                        className: "size-4"
                    }, void 0, false, {
                        fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
                        lineNumber: 68,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
                    lineNumber: 67,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$10_$5f40$types$2b$react$40$19$2e$2$2e$_ev5zajhol2oflkpl4apxvfxu44$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ItemText"], {
                "data-inspector-line": "125",
                "data-inspector-column": "6",
                "data-inspector-relative-path": "src/components/ui/select.tsx",
                children: children
            }, void 0, false, {
                fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
        lineNumber: 65,
        columnNumber: 10
    }, this);
}
_c6 = SelectItem;
function SelectSeparator({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$10_$5f40$types$2b$react$40$19$2e$2$2e$_ev5zajhol2oflkpl4apxvfxu44$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Separator"], {
        "data-inspector-line": "135",
        "data-inspector-column": "4",
        "data-inspector-relative-path": "src/components/ui/select.tsx",
        "data-slot": "select-separator",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-border pointer-events-none -mx-1 my-1 h-px", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
        lineNumber: 78,
        columnNumber: 10
    }, this);
}
_c7 = SelectSeparator;
function SelectScrollUpButton({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$10_$5f40$types$2b$react$40$19$2e$2$2e$_ev5zajhol2oflkpl4apxvfxu44$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollUpButton"], {
        "data-inspector-line": "148",
        "data-inspector-column": "4",
        "data-inspector-relative-path": "src/components/ui/select.tsx",
        "data-slot": "select-scroll-up-button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex cursor-default items-center justify-center py-1", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUpIcon$3e$__["ChevronUpIcon"], {
            "data-inspector-line": "156",
            "data-inspector-column": "6",
            "data-inspector-relative-path": "src/components/ui/select.tsx",
            className: "size-4"
        }, void 0, false, {
            fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
            lineNumber: 85,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
        lineNumber: 84,
        columnNumber: 10
    }, this);
}
_c8 = SelectScrollUpButton;
function SelectScrollDownButton({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$2$2e$3_$40$types$2b$react$40$19$2e$2$2e$10_$5f40$types$2b$react$40$19$2e$2$2e$_ev5zajhol2oflkpl4apxvfxu44$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollDownButton"], {
        "data-inspector-line": "166",
        "data-inspector-column": "4",
        "data-inspector-relative-path": "src/components/ui/select.tsx",
        "data-slot": "select-scroll-down-button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex cursor-default items-center justify-center py-1", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
            "data-inspector-line": "174",
            "data-inspector-column": "6",
            "data-inspector-relative-path": "src/components/ui/select.tsx",
            className: "size-4"
        }, void 0, false, {
            fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
            lineNumber: 93,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/workspace/projects/src/components/ui/select.tsx",
        lineNumber: 92,
        columnNumber: 10
    }, this);
}
_c9 = SelectScrollDownButton;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9;
__turbopack_context__.k.register(_c, "Select");
__turbopack_context__.k.register(_c1, "SelectGroup");
__turbopack_context__.k.register(_c2, "SelectValue");
__turbopack_context__.k.register(_c3, "SelectTrigger");
__turbopack_context__.k.register(_c4, "SelectContent");
__turbopack_context__.k.register(_c5, "SelectLabel");
__turbopack_context__.k.register(_c6, "SelectItem");
__turbopack_context__.k.register(_c7, "SelectSeparator");
__turbopack_context__.k.register(_c8, "SelectScrollUpButton");
__turbopack_context__.k.register(_c9, "SelectScrollDownButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/workspace/projects/src/lib/data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// 项目数据模型和模拟数据
__turbopack_context__.s([
    "allTasks",
    ()=>allTasks,
    "dashboardStats",
    ()=>dashboardStats,
    "documentTemplates",
    ()=>documentTemplates,
    "knowledgeArticles",
    ()=>knowledgeArticles,
    "milestones",
    ()=>milestones,
    "projects",
    ()=>projects,
    "systemStatus",
    ()=>systemStatus,
    "teamMembers",
    ()=>teamMembers
]);
const teamMembers = [
    {
        id: '1',
        name: '张实施顾问',
        role: 'manager',
        email: 'zhang.consultant@company.com'
    },
    {
        id: '2',
        name: '李技术专家',
        role: 'consultant',
        email: 'li.consultant@company.com'
    },
    {
        id: '3',
        name: '王开发工程师',
        role: 'developer',
        email: 'wang.dev@company.com'
    },
    {
        id: '4',
        name: '刘测试工程师',
        role: 'tester',
        email: 'liu.tester@company.com'
    },
    {
        id: '5',
        name: '陈项目经理',
        role: 'admin',
        email: 'chen.pm@company.com'
    }
];
const projects = [
    {
        id: 'proj-001',
        name: '华润集团 Ariba 项目',
        description: '华润集团采购数字化转型项目一期',
        client: '华润集团',
        status: 'in_progress',
        startDate: '2024-01-15',
        endDate: '2024-06-30',
        progress: 45,
        manager: '张实施顾问',
        teamSize: 8
    },
    {
        id: 'proj-002',
        name: '中石化 Ariba SLP',
        description: '中石化寻源到付款解决方案实施',
        client: '中国石化',
        status: 'in_progress',
        startDate: '2024-02-01',
        endDate: '2024-08-15',
        progress: 28,
        manager: '李技术专家',
        teamSize: 6
    },
    {
        id: 'proj-003',
        name: '平安科技合同管理',
        description: 'Ariba Contracts 合同管理模块实施',
        client: '平安科技',
        status: 'planning',
        startDate: '2024-04-01',
        endDate: '2024-09-30',
        progress: 10,
        manager: '王开发工程师',
        teamSize: 5
    }
];
const milestones = [
    {
        id: 'ms-001',
        name: '项目准备',
        phase: 'preparation',
        description: '项目启动、团队组建、环境准备',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        progress: 100,
        status: 'completed',
        tasks: [
            {
                id: 't-001',
                title: '项目启动会',
                category: 'document',
                status: 'completed',
                priority: 'high',
                comments: [],
                createdAt: '2024-01-15',
                updatedAt: '2024-01-15'
            },
            {
                id: 't-002',
                title: '环境搭建',
                category: 'config',
                status: 'completed',
                priority: 'medium',
                comments: [],
                createdAt: '2024-01-16',
                updatedAt: '2024-01-20'
            },
            {
                id: 't-003',
                title: '需求调研',
                category: 'document',
                status: 'completed',
                priority: 'high',
                comments: [],
                createdAt: '2024-01-17',
                updatedAt: '2024-02-10'
            }
        ]
    },
    {
        id: 'ms-002',
        name: '蓝图设计',
        phase: 'blueprint',
        description: '业务流程设计、方案确认、蓝图评审',
        startDate: '2024-02-16',
        endDate: '2024-03-31',
        progress: 85,
        status: 'in_progress',
        tasks: [
            {
                id: 't-004',
                title: '主数据梳理',
                category: 'document',
                status: 'completed',
                priority: 'high',
                comments: [],
                createdAt: '2024-02-16',
                updatedAt: '2024-02-28'
            },
            {
                id: 't-005',
                title: '流程设计',
                category: 'document',
                status: 'in_progress',
                priority: 'high',
                assignee: teamMembers[1],
                comments: [],
                createdAt: '2024-02-20',
                updatedAt: '2024-03-15'
            },
            {
                id: 't-006',
                title: '集成方案设计',
                category: 'integration',
                status: 'in_progress',
                priority: 'medium',
                assignee: teamMembers[2],
                comments: [],
                createdAt: '2024-02-22',
                updatedAt: '2024-03-10'
            },
            {
                id: 't-007',
                title: '蓝图评审会',
                category: 'document',
                status: 'pending',
                priority: 'high',
                comments: [],
                createdAt: '2024-02-25',
                updatedAt: '2024-02-25'
            }
        ]
    },
    {
        id: 'ms-003',
        name: '开发配置',
        phase: 'development',
        description: '系统配置、功能开发、接口开发',
        startDate: '2024-04-01',
        endDate: '2024-05-31',
        progress: 35,
        status: 'in_progress',
        tasks: [
            {
                id: 't-008',
                title: '基础配置',
                category: 'config',
                status: 'completed',
                priority: 'medium',
                comments: [],
                createdAt: '2024-04-01',
                updatedAt: '2024-04-15'
            },
            {
                id: 't-009',
                title: '采购流程配置',
                category: 'config',
                status: 'in_progress',
                priority: 'high',
                assignee: teamMembers[1],
                comments: [],
                createdAt: '2024-04-05',
                updatedAt: '2024-04-20'
            },
            {
                id: 't-010',
                title: 'ERP接口开发',
                category: 'integration',
                status: 'in_progress',
                priority: 'high',
                assignee: teamMembers[2],
                comments: [],
                createdAt: '2024-04-08',
                updatedAt: '2024-04-25'
            },
            {
                id: 't-011',
                title: '报表开发',
                category: 'config',
                status: 'pending',
                priority: 'medium',
                comments: [],
                createdAt: '2024-04-10',
                updatedAt: '2024-04-10'
            }
        ]
    },
    {
        id: 'ms-004',
        name: '测试验证',
        phase: 'testing',
        description: '单元测试、集成测试、UAT测试',
        startDate: '2024-06-01',
        endDate: '2024-06-20',
        progress: 0,
        status: 'pending',
        tasks: [
            {
                id: 't-012',
                title: '测试用例编写',
                category: 'test',
                status: 'pending',
                priority: 'medium',
                comments: [],
                createdAt: '2024-05-15',
                updatedAt: '2024-05-15'
            },
            {
                id: 't-013',
                title: '系统测试',
                category: 'test',
                status: 'pending',
                priority: 'high',
                comments: [],
                createdAt: '2024-05-20',
                updatedAt: '2024-05-20'
            },
            {
                id: 't-014',
                title: 'UAT测试',
                category: 'test',
                status: 'pending',
                priority: 'high',
                comments: [],
                createdAt: '2024-06-01',
                updatedAt: '2024-06-01'
            }
        ]
    },
    {
        id: 'ms-005',
        name: '上线部署',
        phase: 'deployment',
        description: '数据迁移、系统上线、运维支持',
        startDate: '2024-06-21',
        endDate: '2024-06-30',
        progress: 0,
        status: 'pending',
        tasks: [
            {
                id: 't-015',
                title: '数据准备',
                category: 'document',
                status: 'pending',
                priority: 'high',
                comments: [],
                createdAt: '2024-06-01',
                updatedAt: '2024-06-01'
            },
            {
                id: 't-016',
                title: '数据迁移',
                category: 'config',
                status: 'pending',
                priority: 'high',
                comments: [],
                createdAt: '2024-06-15',
                updatedAt: '2024-06-15'
            },
            {
                id: 't-017',
                title: '系统上线',
                category: 'config',
                status: 'pending',
                priority: 'urgent',
                comments: [],
                createdAt: '2024-06-21',
                updatedAt: '2024-06-21'
            }
        ]
    }
];
const allTasks = milestones.flatMap((m)=>m.tasks);
const knowledgeArticles = [
    {
        id: 'kb-001',
        title: 'Ariba采购申请审批流程配置指南',
        category: 'standard',
        subcategory: '配置指南',
        content: '本文档详细介绍了如何在Ariba中配置采购申请审批流程...',
        tags: [
            '采购申请',
            '审批流程',
            '配置'
        ],
        author: 'SAP官方',
        createdAt: '2024-01-10',
        updatedAt: '2024-03-15',
        views: 1256
    },
    {
        id: 'kb-002',
        title: 'Ariba与SAP ERP集成最佳实践',
        category: 'standard',
        subcategory: '最佳实践',
        content: '集成是Ariba实施中最关键的环节之一...',
        tags: [
            '集成',
            'ERP',
            '最佳实践',
            '收藏'
        ],
        author: 'SAP官方',
        createdAt: '2024-01-12',
        updatedAt: '2024-03-20',
        views: 987
    },
    {
        id: 'kb-003',
        title: '供应商主数据管理规范',
        category: 'project',
        subcategory: '企业背景知识',
        content: '根据华润集团供应商管理要求...',
        tags: [
            '供应商',
            '主数据'
        ],
        author: '张实施顾问',
        createdAt: '2024-02-01',
        updatedAt: '2024-03-10',
        views: 345
    },
    {
        id: 'kb-004',
        title: '寻源到付款(S2P)业务流程蓝图',
        category: 'project',
        subcategory: '蓝图设计文档',
        content: '本文档定义了华润集团S2P端到端业务流程...',
        tags: [
            'S2P',
            '流程',
            '蓝图'
        ],
        author: '李技术专家',
        createdAt: '2024-02-20',
        updatedAt: '2024-03-25',
        views: 567
    },
    {
        id: 'kb-005',
        title: 'Ariba API接口开发文档',
        category: 'standard',
        subcategory: '接口指南',
        content: 'Ariba提供丰富的RESTful API支持...',
        tags: [
            'API',
            '开发',
            '接口',
            '收藏'
        ],
        author: 'SAP官方',
        createdAt: '2024-01-15',
        updatedAt: '2024-03-18',
        views: 1567
    }
];
const documentTemplates = [
    {
        id: 'tmpl-001',
        name: '业务需求文档(BRD)',
        category: '需求文档',
        description: '用于描述业务需求和功能要求的标准化模板',
        content: '# 业务需求文档\n\n## 1. 文档信息\n- 项目名称：\n- 文档版本：\n- 创建日期：\n- 作者：\n\n## 2. 业务背景\n\n## 3. 业务需求\n\n## 4. 功能需求\n\n## 5. 非功能需求\n\n## 6. 验收标准'
    },
    {
        id: 'tmpl-002',
        name: '功能需求规格说明书',
        category: '需求文档',
        description: '详细描述功能需求的规格说明书模板',
        content: '# 功能需求规格说明书\n\n## 1. 功能概述\n\n## 2. 功能详细描述\n\n## 3. 用户界面要求\n\n## 4. 数据要求\n\n## 5. 业务规则\n\n## 6. 接口要求'
    },
    {
        id: 'tmpl-003',
        name: '测试用例模板',
        category: '测试用例',
        description: '标准化测试用例编写模板',
        content: '# 测试用例\n\n| 用例编号 | 功能点 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |'
    },
    {
        id: 'tmpl-004',
        name: '培训材料模板',
        category: '培训材料',
        description: '用户培训材料编写模板',
        content: '# 用户培训手册\n\n## 1. 培训目标\n\n## 2. 培训对象\n\n## 3. 培训内容\n\n## 4. 操作指南\n\n## 5. 常见问题'
    },
    {
        id: 'tmpl-005',
        name: '周报模板',
        category: '汇报模板',
        description: '项目周报填写模板',
        content: '# 项目周报\n\n## 基本信息\n- 项目名称：\n- 报告周期：\n- 报告人：\n\n## 本周工作完成情况\n\n## 下周工作计划\n\n## 问题与风险\n\n## 资源需求'
    }
];
const dashboardStats = {
    totalProjects: 3,
    inProgressProjects: 2,
    totalTasks: 17,
    completedTasks: 5,
    pendingTasks: 8,
    blockedTasks: 1,
    overallProgress: 45,
    upcomingMilestones: 2,
    recentActivities: [
        {
            id: 1,
            type: 'task_completed',
            content: '王开发工程师完成了「基础配置」任务',
            time: '30分钟前'
        },
        {
            id: 2,
            type: 'comment',
            content: '李技术专家在「流程设计」任务下添加了评论',
            time: '1小时前'
        },
        {
            id: 3,
            type: 'milestone',
            content: '「项目准备」里程碑已完成',
            time: '2小时前'
        },
        {
            id: 4,
            type: 'task_assigned',
            content: '「集成方案设计」任务分配给王开发工程师',
            time: '3小时前'
        }
    ]
};
const systemStatus = {
    services: [
        {
            name: 'Ariba Network',
            status: 'healthy',
            uptime: '99.9%',
            lastCheck: '刚刚'
        },
        {
            name: 'SAP Integration',
            status: 'healthy',
            uptime: '99.5%',
            lastCheck: '刚刚'
        },
        {
            name: 'Database',
            status: 'healthy',
            uptime: '99.99%',
            lastCheck: '刚刚'
        },
        {
            name: 'API Gateway',
            status: 'warning',
            uptime: '98.5%',
            lastCheck: '5分钟前'
        }
    ],
    logs: [
        {
            id: 1,
            level: 'info',
            message: '系统健康检查完成',
            timestamp: '2024-04-15 10:30:00'
        },
        {
            id: 2,
            level: 'warning',
            message: 'API响应时间略长',
            timestamp: '2024-04-15 10:25:00'
        },
        {
            id: 3,
            level: 'info',
            message: '备份任务执行成功',
            timestamp: '2024-04-15 02:00:00'
        },
        {
            id: 4,
            level: 'error',
            message: '接口调用失败重试',
            timestamp: '2024-04-15 09:45:00'
        }
    ],
    metrics: {
        cpu: 45,
        memory: 62,
        disk: 38,
        network: 28
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/workspace/projects/src/app/(app)/team/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TeamPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.6_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.6_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/lucide-react@0.468.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/lucide-react@0.468.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/lucide-react@0.468.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/lucide-react@0.468.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/mail.js [app-client] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/lucide-react@0.468.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/lucide-react@0.468.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/lucide-react@0.468.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/crown.js [app-client] (ecmascript) <export default as Crown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/lucide-react@0.468.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Code$3e$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/lucide-react@0.468.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/code.js [app-client] (ecmascript) <export default as Code>");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$test$2d$tube$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TestTube$3e$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/lucide-react@0.468.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/test-tube.js [app-client] (ecmascript) <export default as TestTube>");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/src/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/src/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/src/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/src/components/ui/avatar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/src/components/ui/select.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/src/lib/data.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
const roleConfig = {
    admin: {
        label: '管理员',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__["Crown"],
        color: 'text-[#F59E0B]',
        bgColor: 'bg-[#F59E0B]/10'
    },
    manager: {
        label: '项目经理',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"],
        color: 'text-[#6366F1]',
        bgColor: 'bg-[#6366F1]/10'
    },
    consultant: {
        label: '实施顾问',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"],
        color: 'text-[#06B6D4]',
        bgColor: 'bg-[#06B6D4]/10'
    },
    developer: {
        label: '开发工程师',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Code$3e$__["Code"],
        color: 'text-[#8B5CF6]',
        bgColor: 'bg-[#8B5CF6]/10'
    },
    tester: {
        label: '测试工程师',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$test$2d$tube$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TestTube$3e$__["TestTube"],
        color: 'text-[#10B981]',
        bgColor: 'bg-[#10B981]/10'
    }
};
function TeamPage() {
    _s();
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [roleFilter, setRoleFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const filteredMembers = __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["teamMembers"].filter((member)=>{
        const matchesSearch = searchQuery === '' || member.name.toLowerCase().includes(searchQuery.toLowerCase()) || member.email.toLowerCase().includes(searchQuery.toLowerCase()) || member.role && member.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || member.role === roleFilter;
        return matchesSearch && matchesRole;
    });
    const activeFilterLabels = [];
    if (searchQuery) activeFilterLabels.push(`搜索: ${searchQuery}`);
    if (roleFilter !== 'all') {
        const config = roleConfig[roleFilter];
        if (config) activeFilterLabels.push(`角色: ${config.label}`);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-inspector-line": "65",
        "data-inspector-column": "4",
        "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "data-inspector-line": "67",
                "data-inspector-column": "6",
                "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        "data-inspector-line": "68",
                        "data-inspector-column": "8",
                        "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                "data-inspector-line": "69",
                                "data-inspector-column": "10",
                                "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                className: "text-2xl font-semibold",
                                children: "团队协作"
                            }, void 0, false, {
                                fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                "data-inspector-line": "70",
                                "data-inspector-column": "10",
                                "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                className: "text-muted-foreground mt-1",
                                children: "管理项目团队成员和权限"
                            }, void 0, false, {
                                fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                lineNumber: 65,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        "data-inspector-line": "74",
                        "data-inspector-column": "8",
                        "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                "data-inspector-line": "75",
                                "data-inspector-column": "10",
                                "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                className: "mr-2 h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                lineNumber: 70,
                                columnNumber: 11
                            }, this),
                            "添加成员"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                "data-inspector-line": "81",
                "data-inspector-column": "6",
                "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                    "data-inspector-line": "82",
                    "data-inspector-column": "8",
                    "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                    className: "p-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            "data-inspector-line": "83",
                            "data-inspector-column": "10",
                            "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                            className: "flex items-center gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    "data-inspector-line": "84",
                                    "data-inspector-column": "12",
                                    "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                    className: "relative flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                            "data-inspector-line": "85",
                                            "data-inspector-column": "14",
                                            "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                            className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                                        }, void 0, false, {
                                            fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                            lineNumber: 80,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                            "data-inspector-line": "86",
                                            "data-inspector-column": "14",
                                            "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                            placeholder: "搜索成员姓名或邮箱...",
                                            className: "pl-10",
                                            value: searchQuery,
                                            onChange: (e)=>setSearchQuery(e.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                            lineNumber: 81,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                    lineNumber: 79,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                    "data-inspector-line": "93",
                                    "data-inspector-column": "12",
                                    "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                    value: roleFilter,
                                    onValueChange: setRoleFilter,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                            "data-inspector-line": "94",
                                            "data-inspector-column": "14",
                                            "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                            className: "w-[160px]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                    "data-inspector-line": "95",
                                                    "data-inspector-column": "16",
                                                    "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                                    className: "mr-2 h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                                    lineNumber: 85,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                    "data-inspector-line": "96",
                                                    "data-inspector-column": "16",
                                                    "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                                    placeholder: "全部角色"
                                                }, void 0, false, {
                                                    fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                                    lineNumber: 86,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                            lineNumber: 84,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                            "data-inspector-line": "98",
                                            "data-inspector-column": "14",
                                            "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                    "data-inspector-line": "99",
                                                    "data-inspector-column": "16",
                                                    "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                                    value: "all",
                                                    children: "全部角色"
                                                }, void 0, false, {
                                                    fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                                    lineNumber: 89,
                                                    columnNumber: 17
                                                }, this),
                                                Object.entries(roleConfig).map(([key, config])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                        "data-inspector-line": "101",
                                                        "data-inspector-column": "18",
                                                        "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                                        value: key,
                                                        children: config.label
                                                    }, key, false, {
                                                        fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                                        lineNumber: 90,
                                                        columnNumber: 68
                                                    }, this))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                            lineNumber: 88,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                    lineNumber: 83,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this),
                        activeFilterLabels.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            "data-inspector-line": "109",
                            "data-inspector-column": "12",
                            "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                            className: "flex items-center gap-2 mt-3 flex-wrap",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    "data-inspector-line": "110",
                                    "data-inspector-column": "14",
                                    "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                    className: "text-xs text-muted-foreground",
                                    children: "当前筛选:"
                                }, void 0, false, {
                                    fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                    lineNumber: 97,
                                    columnNumber: 15
                                }, this),
                                activeFilterLabels.map((label)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        "data-inspector-line": "112",
                                        "data-inspector-column": "16",
                                        "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                        variant: "secondary",
                                        className: "text-xs",
                                        children: label
                                    }, label, false, {
                                        fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                        lineNumber: 98,
                                        columnNumber: 48
                                    }, this)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    "data-inspector-line": "116",
                                    "data-inspector-column": "14",
                                    "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                    variant: "ghost",
                                    size: "sm",
                                    className: "h-6 text-xs",
                                    onClick: ()=>{
                                        setSearchQuery('');
                                        setRoleFilter('all');
                                    },
                                    children: "清除"
                                }, void 0, false, {
                                    fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                    lineNumber: 101,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                            lineNumber: 96,
                            columnNumber: 45
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                    lineNumber: 77,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "data-inspector-line": "133",
                "data-inspector-column": "6",
                "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                className: "grid grid-cols-2 md:grid-cols-5 gap-4",
                children: Object.entries(roleConfig).map(([key, config])=>{
                    const Icon = config.icon;
                    const count = __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["teamMembers"].filter((m)=>m.role === key).length;
                    const isActive = roleFilter === key;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        "data-inspector-line": "140",
                        "data-inspector-column": "12",
                        "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('cursor-pointer hover:border-[#6366F1]/50 transition-colors', isActive && 'border-[#6366F1] ring-1 ring-[#6366F1]/20'),
                        onClick: ()=>setRoleFilter(isActive ? 'all' : key),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                            "data-inspector-line": "148",
                            "data-inspector-column": "14",
                            "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                            className: "p-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                "data-inspector-line": "149",
                                "data-inspector-column": "16",
                                "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        "data-inspector-line": "150",
                                        "data-inspector-column": "18",
                                        "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('h-10 w-10 rounded-lg flex items-center justify-center', config.bgColor),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                            "data-inspector-line": "151",
                                            "data-inspector-column": "20",
                                            "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('h-5 w-5', config.color)
                                        }, void 0, false, {
                                            fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                            lineNumber: 121,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                        lineNumber: 120,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        "data-inspector-line": "153",
                                        "data-inspector-column": "18",
                                        "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                "data-inspector-line": "154",
                                                "data-inspector-column": "20",
                                                "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                                className: "text-2xl font-bold",
                                                children: count
                                            }, void 0, false, {
                                                fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                                lineNumber: 124,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                "data-inspector-line": "155",
                                                "data-inspector-column": "20",
                                                "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                                className: "text-xs text-muted-foreground",
                                                children: config.label
                                            }, void 0, false, {
                                                fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                                lineNumber: 125,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                        lineNumber: 123,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                lineNumber: 119,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                            lineNumber: 118,
                            columnNumber: 15
                        }, this)
                    }, key, false, {
                        fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                        lineNumber: 117,
                        columnNumber: 16
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                "data-inspector-line": "165",
                "data-inspector-column": "6",
                "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        "data-inspector-line": "166",
                        "data-inspector-column": "8",
                        "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                            "data-inspector-line": "167",
                            "data-inspector-column": "10",
                            "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                            className: "text-lg",
                            children: [
                                "团队成员 (",
                                filteredMembers.length,
                                filteredMembers.length !== __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["teamMembers"].length && ` / ${__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["teamMembers"].length}`,
                                ")"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                            lineNumber: 136,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                        lineNumber: 135,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                        "data-inspector-line": "172",
                        "data-inspector-column": "8",
                        "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                        className: "p-0",
                        children: filteredMembers.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            "data-inspector-line": "174",
                            "data-inspector-column": "12",
                            "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                            className: "p-8 text-center text-muted-foreground",
                            children: "没有找到匹配的团队成员"
                        }, void 0, false, {
                            fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                            lineNumber: 142,
                            columnNumber: 43
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            "data-inspector-line": "178",
                            "data-inspector-column": "12",
                            "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                            className: "divide-y divide-border",
                            children: filteredMembers.map((member)=>{
                                const config = roleConfig[member.role];
                                if (!config) return null;
                                const RoleIcon = config.icon;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    "data-inspector-line": "185",
                                    "data-inspector-column": "18",
                                    "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                    className: "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Avatar"], {
                                            "data-inspector-line": "189",
                                            "data-inspector-column": "20",
                                            "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                            className: "h-12 w-12",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AvatarFallback"], {
                                                "data-inspector-line": "190",
                                                "data-inspector-column": "22",
                                                "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                                className: "bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white text-lg",
                                                children: member.name.charAt(0)
                                            }, void 0, false, {
                                                fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                                lineNumber: 151,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                            lineNumber: 150,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            "data-inspector-line": "194",
                                            "data-inspector-column": "20",
                                            "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                            className: "flex-1 min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    "data-inspector-line": "195",
                                                    "data-inspector-column": "22",
                                                    "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                            "data-inspector-line": "196",
                                                            "data-inspector-column": "24",
                                                            "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                                            className: "font-medium",
                                                            children: member.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                                            lineNumber: 157,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                            "data-inspector-line": "197",
                                                            "data-inspector-column": "24",
                                                            "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-xs', config.color, config.bgColor),
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RoleIcon, {
                                                                    "data-inspector-line": "198",
                                                                    "data-inspector-column": "26",
                                                                    "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                                                    className: "h-3 w-3 mr-1"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                                                    lineNumber: 159,
                                                                    columnNumber: 27
                                                                }, this),
                                                                config.label
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                                            lineNumber: 158,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                                    lineNumber: 156,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    "data-inspector-line": "202",
                                                    "data-inspector-column": "22",
                                                    "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                                    className: "flex items-center gap-4 mt-1 text-sm text-muted-foreground",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        "data-inspector-line": "203",
                                                        "data-inspector-column": "24",
                                                        "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                                        className: "flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                                                                "data-inspector-line": "204",
                                                                "data-inspector-column": "26",
                                                                "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                                                className: "h-3 w-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                                                lineNumber: 165,
                                                                columnNumber: 27
                                                            }, this),
                                                            member.email
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                                        lineNumber: 164,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                                    lineNumber: 163,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                            lineNumber: 155,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                            "data-inspector-line": "209",
                                            "data-inspector-column": "20",
                                            "data-inspector-relative-path": "src/app/(app)/team/page.tsx",
                                            className: "h-4 w-4 text-muted-foreground"
                                        }, void 0, false, {
                                            fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                            lineNumber: 170,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, member.id, true, {
                                    fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                                    lineNumber: 149,
                                    columnNumber: 20
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                            lineNumber: 144,
                            columnNumber: 22
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
                lineNumber: 134,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/workspace/projects/src/app/(app)/team/page.tsx",
        lineNumber: 60,
        columnNumber: 10
    }, this);
}
_s(TeamPage, "haYak9IIheZzmgHTQgc1OZFoAoI=");
_c = TeamPage;
var _c;
__turbopack_context__.k.register(_c, "TeamPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=workspace_projects_src_203ec762._.js.map