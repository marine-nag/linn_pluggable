"use strict"

define(function (require) {
    const placeholderManager = require("core/placeholderManager");
    const ngComponent = require("core/ngComponent");
    
    const pdfMake = require('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/pdfmake.js');
    const pdfFonts = require('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/vfs_fonts.js');
    const bwipjs = require('https://cdnjs.cloudflare.com/ajax/libs/bwip-js/3.0.0/bwip-js.js');
    
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
        
        class OrderVM {
            DeliveryNote = '';
            GiftNote = '';
            ShipTo = '';
            PrintedDate = new Date();
            
            UKPlantPassportB = '';
            UKPlantPassportC = '';
            
            BoxType = '';
            PalletGroup = '';
            
            CarrierName = '';
            Barcode = '';
            
            packages = []; // = new OrderItemVM[];
        }
        class PackageVM {
            items = [];
        }
        
        class OrderItemVM {
            SKU = '';
            Qty = 1;
            Supplier = '';
        }
        
        this.onClick = () => {
            
            //pdfMake.vfs = pdfFonts.pdfMake.vfs;
            
            var orders = $scope.viewStats.get_selected_orders();
 
            /*if (orders.length < 1) {
                alert('Please select at least one order');
                return;
            }*/
            
            /*if (orders.length > 30) {
                alert('You can generate labels for 30 orders maximum');
                return;
            }*/
            
            $scope.getOrderDataBySomeID();
        };
        
        // Generate Barcode
        $scope.textToBarCodeBase64 = function(textStr) {
            let canvas = document.createElement('canvas');
            
            bwipjs.toCanvas(canvas, {
                    bcid:        'code128',       // Barcode type
                    text:        textStr,    // Text to encode
                    scale:       3,               // 3x scaling factor
                    height:      10,              // Bar height, in millimeters
                    includetext: false,            // Show human-readable text
                    textxalign:  'center',        // Always good to set this
            });
            
            return canvas.toDataURL('image/png');
        };
         ///======
        // Try to get data by macros with type API
        $scope.getOrderDataBySomeID = function(){  
                const self = this;
                
                const serviceOrder = new Services.OrdersService(self);
                const serviceInv = new Services.InventoryService(self);
                
                var orderObjects = $scope.viewStats.get_selected_orders_objects();
            
                var orderIDs = [];
               
                orderObjects.forEach(function(item) {
                    orderIDs.push(item.OrderId);
                });
                
                //===============
                // GET Orders data (order Notes, etc....) 
                serviceOrder.GetOrdersById(orderIDs, function (result) {
                    if(result.error == null) 
                    {
                        var orders = result.result;
                        
                        // GET Necessary data for required orders 
                        
                        orders.forEach(function(order)
                        {
                        });
                        
                        ordersData.push(orders[0]);
                     
                        // === GET Notes                    
                        
                        
                        
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
                              
                                // === Creating PDF invoice
                              
                                var date = new Date();
                                
                                 var docDefinition = {
                                  info: {
                                    title:
                                      "Invoice",
                                    author: "",
                                    subject: "Invoice",
                                    keywords: "Invoice",
                                  },
                                  content: [  
                                    {
                                          columns: [  
                                          [
                                              { 
                                                text: 'Hello driver',  
                                                style: 'sectionHeader'
                                              }
                                          ]
                                        ]
                                    },
                                    {
                                        columns: [
                                            [{
                                                text: 'NOTE 1 kjlksjkldfg sdfkjsdl sdlfjlsdkjerf  lskdfjlaskjferlklerkjtlsekr sldfkvdflkvdlfkvbsdlf selrijueritueroiuldkf sldkfgjlsdfkgjdlsfk lkdfjglsdkfjg ldkfjlsdfjgkldf sldfjsio xoiv xoicvuzo ;ll;klkopiopio',
                                                style: 'sectionNotes', maxHeight: 600
                                            }], 
                                            [{
                                                text: 'NOTE 2',
                                                style: 'sectionNotes'
                                            }]
                                        ]
                                    },
                                    {  
                                        text: 'PATCH',  
                                        style: 'sectionHeader'  
                                    },
                                    // PATCH ORDER Data
                                    {
                                        columns: [
                                            [{
                                                text: 'Ship to', 
                                                bold: true
                                            }, 
                                            {
                                                text: '3827978979'
                                            },
                                             {
                                                text: 'Printed date', 
                                                bold: true
                                            }, 
                                            {
                                                text: date.toDateString(), 
                                                style: 'sectionShipping',
                                                margin: [0,0, 0, 30]
                                            }],
                                            
                                            [{
                                                text: 'UK Plant passport', 
                                                bold: true
                                            }, 
                                            {
                                                text: '3827978979'
                                            }, 
                                            {
                                                text: '3827978979', 
                                                style: 'sectionShipping'
                                            }],
                                            
                                            [{
                                                text: [ { text: 'Carrier ', bold: true }, { text: 'q231', bold: false } ], 
                                                bold: true
                                            }, 
                                            {
                                                text: [ { text: 'Box type ', bold: true }, { text: 'asdf213', bold: false } ],
                                                bold: true
                                            }, 
                                            {
                                                text: [ { text: 'Pallet group ', bold: true }, { text: 'lklkjljkl', bold: false } ],
                                                bold: true,
                                                style: 'sectionShipping'
                                            }],
                                            
                                           /* [{
                                                text: 'sldjflkgj',
                                                alignment: 'left'
                                            }, 
                                            {
                                                text: '8rieru8dfjk',
                                                alignment: 'left'
                                            }, 
                                            {
                                                text: 'sxcvmlerj',
                                                alignment: 'left',
                                                style: 'sectionShipping'
                                            }],*/
                                            
                                            //
                                            [
                                                {
                                                    text: orderObjects[0].NumOrderId.toString(),
                                                    bold: true, 
                                                    alignment: 'center'
                                                },
                                                {
                                                    image : $scope.textToBarCodeBase64(orderObjects[0].NumOrderId.toString()),
                                                    width: 85,
                                                    height: 18, 
                                                    alignment: 'center'
                                                },
                                                {
                                                    text: 'Parcel 1 of 2',
                                                    bold: true, 
                                                    alignment: 'center',
                                                    style: 'sectionShipping'
                                                }
                                            ]
                                        ]
                                    },
                                      ,
        { 
             text: '\n\nUnordered list with longer lines', 
             style: 'header', 
             pageBreak: 'before', 
             pageOrientation: 'landscape' 
        },
                                    // ORDER ITEMS
                                    {  
                                        table: {  
                                            headerRows: 1,  
                                            //widths: ['*', '*', '10%', '', ''],  
                                            body: [  
                                                ['Image', 'Item', 'Qty', 'UK Plant passport', 'Supplier document'],  
                                                
                                                ['', '', 'А: влдаопдав фівдлалджіва іва ', '', 'sdfgsdfgl;df \n оадлівоалд івадлопівдо іваоп цзцщкшезц зщпізащш іваплд діполдіваполд']  
                                            ]  
                                        }  
                                    }   
                                  ],  
                                  styles: {  
                                        sectionHeader: {  
                                            bold: true,  
                                            //decoration: 'underline',  
                                            fontSize: 18,  
                                            margin: [0, 15, 0, 15]  
                                      }, 
                                      sectionNotes: {
                                            fontSize: 12, 
                                            bold: false,
                                            margin: [0, 15, 0, 15]  
                                      },
                                      sectionShipping: {
                                            fontSize: 12,
                                            margin: [0, 0, 0, 30]
                                      }
                                    }  
                                };
                                
                                
                                pdfMake.createPdf(docDefinition).open();
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
