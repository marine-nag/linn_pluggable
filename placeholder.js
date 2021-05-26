"use strict"

define(function (require) {

    const placeholderManager = require("core/placeholderManager");

    var placeHolder = function ($scope, $element, controlService) {

        const _this = this;
        this.getItems = () => {
            var items = [{
                text: "Print Invoices",  // Button name
                key: "placeholderPrintInvoiceTemplate",  // Button id (unique)
                icon: "fa fa-print",  // Button icon
                content: {
                    moduleName: "placeholderPrintInvoiceTemplate",
                    controlName: "placeholderPrintInvoiceTemplate"
                }
            }];

            return items;
        };

        this.isEnabled = (itemKey) => {
            return true;
        };

        this.onClick = () => {

            this.disabled = 'disabled';

            var s = $scope.viewStats.get_selected_orders();
            if (s.length < 1) {
                alert('Please select at least one order');
                return;
            }
            if (s.length > 30) {
                alert('you can generate labels for 30 orders maximum');
                return;
            }
            _this.isEnabled = (itemKey) => {
                return false;
            };
            setTimeout(function () {
                _this.isEnabled = (itemKey) => {
                    return true;
                }
            }, 60000);

            let url = 'https://www.google.com/';
            // url += s.map(x => x.id).join('&ids=');
            var win = window.open(url, '_blank');
            win.focus();
        };

    };

    placeholderManager.register("OpenOrders_OrderControlButtons", placeHolder);

});
