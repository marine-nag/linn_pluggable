"use strict"

define(function (require) {
    const placeholderManager = require("core/placeholderManager");
    const ngComponent = require("core/ngComponent");
    
    const { jsPDF } = require('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.3.1/jspdf.umd.js');
    const pickingService = require('services/ordersservice');
    
    var ordersData = [];
    var itemData = [];    
    
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
            var orders = $scope.viewStats.get_selected_orders();
 
            if (orders.length < 1) {
                alert('Please select at least one order');
                return;
            }
            
            /*if (orders.length > 30) {
                alert('You can generate labels for 30 orders maximum');
                return;
            }*/
            
            $scope.getOrderDataBySomeID();
        };
        
         ///======
        // Try to get data by macros with type API
        $scope.getOrderDataBySomeID = function(){  
                const self = this;
                
                const serviceOrder = new Services.OrdersService(self);
                const serviceInv = new Services.InventoryService(self);
                
                const dash = new Services.DashboardsService(self);
             
                var orderObjects = $scope.viewStats.get_selected_orders_objects();
            
                var orderIDs = [];
               
                orderObjects.forEach(function(item) {
                    orderIDs.push(orderObjects[0].OrderId);
                });
                
                //===============
                // GET Orders data (order Notes, etc....) 
                serviceOrder.GetOrdersById(orderIDs, function (result) {
                    if(result.error == null) 
                    {
                        var orders = result.result;
                        
                        ordersData.push(orders[0]);
                        
                        //alert('Something there! Notes: ' + orders.length);
                        
                        // GET Order Extended Properties
                        serviceOrder.getExtendedProperties(orderIDs[0], function(orderExtProps) {
                            var o = orderExtProps;
                        });
                        
                        
                        //================
                        // GET StockItems data (suppliers, images, etc....) 
                        var itemID = orderObjects[0].Items[0].ItemId;
                        
                        serviceInv.getInventoryItemById(itemID, function (result) {
                            
                            if(result.error == null) 
                            {
                                itemData.push(result);
                                //alert('Something there! ' + result.length + ' items.');
                            
                                serviceInv.GetInventoryItemImages(itemID, function (resultImg) {
                                    var t = resultImg;
                                });
                                
                                // GET required extended props of items
                                var ext_props = ['patch_name', 'customs_name', 'country_of_original'];
                                serviceInv.GetInventoryItemExtendedProperties(itemID, ext_props, function(itemExtProps) {
                                    var t2 = itemExtProps;
                                });
                                
                                // GET required supplier of item
                                serviceInv.GetStockSupplierStat(itemID, function(suppliers) {
                                    //alert('Get suppliers');
                                    var suppl = suppliers;
                                });
                                
                               /* var pdfDoc = new jsPDF();
                                
                                pdfDoc.setProperties({
                                    title: 'Invoice'
                                });

                                pdfDoc.cellInitialize();*/
                                
                                //===============================
                                
                                var doc = new jsPDF();
                                var col = ["Sr. No.","Details"];
                                var col1 = ["Details", "Values"];
                                var rows = [];
                                var rows1 = [];
                                
                                var itemNew = [
                                  { index:'1',id: 'Case Number', name : '101111111' },
                                  { index:'2',id: 'Patient Name', name : 'UAT DR' },
                                  { index:'3',id: 'Hospital Name', name: 'Dr Abcd' }
                                ];


                                itemNew.forEach(element => {      
                                        var temp = [element.index,element.id];
                                        var temp1 = [element.id,element.name];
                                        rows.push(temp);
                                        rows1.push(temp1);

                                    });        

                                doc.autoTable(col, rows, { startY: 10 });

                                doc.autoTable(col1, rows1, { startY: 60 });
                                doc.save('Test.pdf');
                                
                                //===================================
                               // pdfDoc.text(20, 20, 'Hello world.'); 
                                //pdfDoc.save('Test.pdf');
                            } 
                            else 
                            {
                                alert('Errors!');
                            }
                        });
                    } 
                    else 
                    {
                        alert('Errors!');
                    }
                 });
            };
    };
   
    placeholderManager.register("OpenOrders_OrderControlButtons", placeHolder);

});
