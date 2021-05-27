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

            var orders = $scope.viewStats.get_selected_orders();
            
            var t = $scope.viewStats.get_selected_orders_objects();
            
            if (s.length < 1) {
                alert('Please select at least one order');
                return;
            }
            if (s.length > 30) {
                alert('you can generate labels for 30 orders maximum');
                return;
            }
            
            var y = $scope.$root.session.token;
            
            var arrIds = [];
            
            orders.forEach(function(item){
                    arrIds.push(item.id);        
                }
            );
            
            $.ajax({
                type: 'POST',
                url: $scope.$root.session.server + '/api/Macro/Run?applicationName=TEST_PrintInvoices&macroName=TEST_print_invoices',
                data: arrIds,
                headers: {
                    'Authorization': $scope.$root.session.token, 
                    'Content-Type': 'application/json; charset=utf-8', 
                    'Accept-Language': 'en-US, en'
                }
            }).done(function(data) {
                let url = 'https://www.google.com/';
                var win = window.open(url, '_blank');
                win.focus();
            });           
        };

    };

    placeholderManager.register("OpenOrders_OrderControlButtons", placeHolder);

});
