(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{42:function(module,__webpack_exports__,__webpack_require__){"use strict";eval('__webpack_require__.r(__webpack_exports__);\n\n// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./src/components/Item.vue\n//\n//\n//\n//\n//\n//\n//\n\n/* harmony default export */ var Item = ({\n    asyncData({ store, route }) {\n        return store.dispatch("users");\n    },\n    computed: {\n        counter: function () {\n            return this.$store.state.count;\n        },\n        users: function () {\n            return this.$store.state.users;\n        }\n    },\n    methods: {\n        inc: function () {\n            this.$store.dispatch("inc");\n        }\n    }\n});\n// CONCATENATED MODULE: ./node_modules/vue-loader/lib/template-compiler?{"id":"data-v-05c945ee","hasScoped":false,"optionsId":"0","buble":{"transforms":{}}}!./node_modules/vue-loader/lib/template-compiler/preprocessor.js?engine=pug&optionsId=0!./node_modules/vue-loader/lib/selector.js?type=template&index=0!./src/components/Item.vue\nvar render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c(\'div\',[_c(\'span\',[_vm._v(_vm._s(_vm.counter))]),_c(\'button\',{on:{"click":_vm.inc}},[_vm._v("+")]),_c(\'p\',[_vm._v("item component "+_vm._s(_vm.counter))]),_c(\'div\',[_vm._v(_vm._s(_vm.users))])])}\nvar staticRenderFns = []\n\n// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/component-normalizer.js\nvar component_normalizer = __webpack_require__(2);\n\n// CONCATENATED MODULE: ./src/components/Item.vue\n/* script */\n\n\n/* template */\n\n/* template functional */\nvar Item_vue_template_functional_ = false\n/* styles */\nvar Item_vue_styles_ = null\n/* scopeId */\nvar Item_vue_scopeId_ = null\n/* moduleIdentifier (server only) */\nvar Item_vue_module_identifier_ = null\n\nvar Item_Component = Object(component_normalizer["a" /* default */])(\n  Item,\n  render,\n  staticRenderFns,\n  Item_vue_template_functional_,\n  Item_vue_styles_,\n  Item_vue_scopeId_,\n  Item_vue_module_identifier_\n)\n\n/* harmony default export */ var components_Item = __webpack_exports__["default"] = (Item_Component.exports);\n\n\n//# sourceURL=webpack:///./src/components/Item.vue_+_2_modules?')}}]);