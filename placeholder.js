"use strict"

define(function (require) {

    const placeholderManager = require("core/placeholderManager");
    const ngComponent = require("core/ngComponent");
    
    const pickingService = require('services/ordersservice');
    
    const angular = require("angular");
    angular.module('Components').factory('OrderProcesses', ['openOrdersService', function OrderProcessesFactory(openOrdersService) {
        var y = 0;   
    };
    
    var placeHolder = function ($scope, $element, controlService) {

        //const _this = this;
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
            
            //var self = this;

            //let inventoryService = new Services.InventoryService(self.options);
            //var service = new Services.OrdersService(self.options);
                
            if (orders.length < 1) {
                alert('Please select at least one order');
                return;
            }
            if (orders.length > 30) {
                alert('you can generate labels for 30 orders maximum');
                return;
            }
            
            var y = $scope.$root.session.token;
            
            var arrIds = [];
            
            orders.forEach(function(item){
                    arrIds.push(item.id);        
                }
            );
          
            var itemsGr = $element;
            
            $scope.getOrderDataBySomeID();
        };
        
         ///======
            // Try to get data by macros with type API
            $scope.getOrderDataBySomeID = function(){  
                
                const service1 = new Services.OrdersService();
                var s = new Services();
                
            var orders = $scope.viewStats.get_selected_orders();
            
            var t = $scope.viewStats.get_selected_orders_objects();
            
                
                var arr = [];
                arr.push(t[0].OrderId);
            
                var desc = service1.GetOrdersById(arr);
                
                /*$.ajax({
                    type: 'POST',
                    url: $scope.$root.session.server + '/api/Macro/Run?applicatioName=TEST_PrintInvoices&macroName=TEST_print_invoices',
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
                }); */
            };
    };
   
    placeholderManager.register("OpenOrders_OrderControlButtons", placeHolder);

});
