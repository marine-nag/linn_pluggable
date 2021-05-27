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

            //this.disabled = 'disabled';

            var s = $scope.viewStats.get_selected_orders();
            
            var t = $scope.viewStats.get_selected_orders_objects();
            
            var server = $scope.lwServer;
            var server1 = $scope.lvServer;
            
            if (s.length < 1) {
                alert('Please select at least one order');
                return;
            }
            if (s.length > 30) {
                alert('you can generate labels for 30 orders maximum');
                return;
            }
            
            var y = $scope.Token;
            var y2 = $scope.server;
            
            $.ajax({
                type: 'POST',
                url: 'https://eu.linnworks.net/api/Macro/Run?applicationName=TEST_PrintInvoices&macroName=TEST_print_invoices',
                data: null,
                headers: {'Authorization': $scope.Token, 'Content-Type': 'application/json; charset=utf-8', 'Accept-Language': 'application/json'}
            }).done(function(data) {
                let url = 'https://www.google.com/';
                var win = window.open(url, '_blank');
                win.focus();
            });           
        };

    };

    placeholderManager.register("OpenOrders_OrderControlButtons", placeHolder);

});
