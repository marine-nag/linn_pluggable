"use strict"

define(function (require) {
    const placeholderManager = require("core/placeholderManager");
    const ngComponent = require("core/ngComponent");
    
    const pdfMake = require('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/pdfmake.js');
    const pdfFonts = require('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/vfs_fonts.js');
    const bwipjs = require('https://cdnjs.cloudflare.com/ajax/libs/bwip-js/3.0.0/bwip-js.js');
    
    
    var docDefinition;
    
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
            
            $scope.getOrderDataBySomeID();
        };
        
        $scope.toImageFromUrl = function(imgUrl, callback){
              
             var img = new Image();

             var canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              var ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0);
              var dataURL = canvas.toDataURL("image/png"),
              dataURL = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
              // set attributes and src 
              img.setAttribute('crossOrigin', 'anonymous'); //
              img.src = imgUrl; 
              return callback(dataURL); // the base64 string
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
        
        /// ======
        // Try to get data by macros API
        $scope.getOrderDataBySomeID = function(){  
                var base64Logo = $scope.toImageFromUrl('https://marine-nag.github.io/linn_pluggable.github.io/PP_logo2.png', function(dataUrl) {
                  return dataUrl;
                })
            
                const self = this;
                
                const macroService = new Services.MacroService(self);
            
                var orderObjects = $scope.viewStats.get_selected_orders_objects();
            
                var orderIDs = [];
               
                orderObjects.forEach(function(item) {
                    orderIDs.push(item.OrderId);
                });
            
                var obj = {applicationName : 'TEST_PrintInvoices', macroName : 'TEST_print_invoices', orderIds: orderIDs };
            
                // RUN Macro to get necessary data
                macroService.Run(obj, function(data) {
                    if(data.error == null){
                        var orders = data.result;
                        
                        var order = orders[0];
                        
                        // Create orderItem Table for pdf File
                        var body = [];
                        var columns = ['Image', 'Item', 'Qty', 'UK Plant passport', 'Supplier document'];
                        body.push(columns);
                        
                        order.Items.forEach(function(row) {
                            var dataRow = [];
                            
                            dataRow.push(row.ImageSource);
                            dataRow.push(row.SKU);
                            dataRow.push(row.Qty.toString());
                            dataRow.push(row.UKPlantPassportA);
                            dataRow.push(row.SupplierDoc);
                            
                            body.push(dataRow);
                        });
                        
                        //Creating docDefinition
                        var docDefinition = {
                                  info: 
                                  {
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
                                                text: order.DeliveryNote != '' || order.GiftNote != '' ? 'Hello driver' : '',  
                                                style: 'sectionHeader'
                                              }
                                          ]
                                        ]
                                    },
                                    {
                                        columns: [
                                            [{
                                                text: order.DeliveryNote,
                                                style: 'sectionNotes',
                                                maxHeight: 600
                                            }], 
                                            [{
                                                text: order.GiftNote,
                                                style: 'sectionNotes'
                                            }]
                                        ]
                                    },
                                    // PATCH with logotype.
                                    [
                                        {
                                             image : base64Logo,
                                             width: 25,
                                             height: 18, 
                                             alignment: 'center'   
                                        }
                                        ,
                                        {  
                                            text: 'PATCH',  
                                            style: 'sectionHeader'  
                                        }
                                    ],
                                    // PATCH ORDER Data
                                    {
                                        columns: [
                                            [{
                                                text: 'Ship to', 
                                                bold: true
                                            }, 
                                            {
                                                text: order.ShipTo
                                            },
                                             {
                                                text: 'Printed date', 
                                                bold: true
                                            }, 
                                            {
                                                text: order.PrintedDate, 
                                                style: 'sectionShipping',
                                                margin: [0,0, 0, 30]
                                            }],
                                            
                                            [{
                                                text: 'UK Plant passport', 
                                                bold: true
                                            }, 
                                            {
                                                text: 'B: ' + order.UKPlantPassportB
                                            }, 
                                            {
                                                text: 'C: ' + order.UKPlantPassportC,
                                                style: 'sectionShipping'
                                            }],
                                            
                                            [{
                                                text: [ { text: 'Carrier ', bold: true }, { text: order.CarrierName, bold: false } ], 
                                                bold: true
                                            }, 
                                            {
                                                text: [ { text: 'Box type ', bold: true }, { text: order.BoxType, bold: false } ],
                                                bold: true
                                            }, 
                                            {
                                                text: [ { text: 'Pallet group ', bold: true }, { text: order.PalletGroup, bold: false } ],
                                                bold: true,
                                                style: 'sectionShipping'
                                            }],
                                            
                                            //
                                            [
                                                {
                                                    text: order.OrderID,
                                                    bold: true, 
                                                    alignment: 'center'
                                                },
                                                {
                                                    image : $scope.textToBarCodeBase64(order.OrderID),
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
                                    // ORDER ITEMS
                                    {  
                                        table: {  
                                            headerRows: 1,  
                                            //widths: ['*', '*', '10%', '', ''],  
                                            body: body
                                        }  
                                    }   
                                  ],  
                                  //CSS
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
                                
                                //Finally, create a file.
                                pdfMake.createPdf(docDefinition).open();
                    } else {
                        alert('Errors...');
                    } 
                });
        };
    };
   
    placeholderManager.register("OpenOrders_OrderControlButtons", placeHolder);

});
