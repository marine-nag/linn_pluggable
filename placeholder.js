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

        // Generate Barcode
        $scope.textToBarCodeBase64 = function (textStr) {
            let canvas = document.createElement('canvas');

            bwipjs.toCanvas(canvas, {
                bcid: 'code128',       // Barcode type
                text: textStr,    // Text to encode
                scale: 3,               // 3x scaling factor
                height: 10,              // Bar height, in millimeters
                includetext: false,            // Show human-readable text
                textxalign: 'center',        // Always good to set this
            });

            return canvas.toDataURL('image/png');
        };

        /// ======
        // Try to get data by macros API
        $scope.getOrderDataBySomeID = function () {
            const self = this;

            const macroService = new Services.MacroService(self);

            var orderObjects = $scope.viewStats.get_selected_orders_objects();

            var orderIDs = [];

            orderObjects.forEach(function (item) {
                orderIDs.push(item.OrderId);
            });

            var obj = { applicationName: 'TEST_PrintInvoices', macroName: 'TEST_print_invoices', orderIds: orderIDs };

            // Init docDefinition
            docDefinition = {
                info:
                {
                    title:
                        "Invoice",
                    author: "",
                    subject: "Invoice",
                    keywords: "Invoice",
                },
                content: [
                ],
                //CSS
                styles: {
                    sectionHeader: {
                        bold: true,
                        fontSize: 18,
                        //margin: [0, 15, 40, 15]  
                    },
                    sectionNotes: {
                        fontSize: 12,
                        bold: false
                    },
                    sectionShipping: {
                        fontSize: 12,
                        margin: [0, 0, 0, 15]
                    }
                }//,
                //pageMargins: [68, 68, 68, 0]
            };

            // RUN Macro to get necessary data
            macroService.Run(obj, function (data) {
                if ((data.error == null) && (data.result != null) && (data.result.length != 0)) {
                    var orders = data.result;

                    //var order = orders[0];
                    //orders.forEach(function (order) {

                    for (let i = 0; i < orders.length; i++) {
                        var order = orders[i];

                        //order.Packages.forEach(function (pkg, index) {
                        for (let index = 0; index < order.Packages.length; index++) {
                            var pkg = order.Packages[index];

                            // Create body and columns for order items in package...
                            var body = [];
                            var columns = [
                                {
                                    text: 'Image',
                                    bold: true,
                                    fontSize: 11,
                                    margin: [0, 10, 0, 15],
                                    alignment: 'center'
                                },
                                {
                                    text: 'Item',
                                    bold: true,
                                    fontSize: 11,
                                    margin: [0, 10, 0, 15]
                                },
                                {
                                    text: 'Qty',
                                    bold: true,
                                    fontSize: 13,
                                    margin: [0, 10, 0, 15]
                                },
                                {
                                    text: 'UK Plant passport',
                                    bold: true,
                                    fontSize: 11,
                                    margin: [0, 10, 0, 15]
                                },
                                {
                                    text: 'Supplier document',
                                    bold: true,
                                    fontSize: 11,
                                    margin: [0, 10, 0, 15]
                                }];
                            body.push(columns);

                            // Create orderItem Table for pdf File
                            pkg.Items.forEach(function (row) {
                                var dataRow = [];

                                if (row.ImageSource != '' && row.ImageSource != null) {
                                    dataRow.push({
                                        image: 'data:image/' + row.ImageExtension + ';base64,' + row.ImageBase64,
                                        width: 45,
                                        height: 45,
                                        margin: [0, 10, 0, 10]
                                    });
                                }
                                else {
                                    dataRow.push({
                                        text: '',
                                        fontSize: 10,
                                        margin: [0, 10, 0, 10]
                                    });
                                }

                                dataRow.push(
                                    {
                                        text: [
                                            { text: row.PatchName + '\n', bold: true, margin: [0, 0, 0, 15] },
                                            { text: row.SKU + '\n', bold: false },
                                            { text: row.ItemTitle + '\n', bold: false }
                                        ],
                                        bold: true,
                                        fontSize: 10,
                                        margin: [0, 10, 0, 10]
                                    });

                                dataRow.push({
                                    text: row.Qty.toString(),
                                    fontSize: 10,
                                    bold: true,
                                    margin: [0, 10, 0, 10]
                                });
                                dataRow.push({
                                    text: 'A: ' + row.UKPlantPassportA + '\n' + 'D: ' + row.UKPlantPassportD,
                                    margin: [0, 10, 0, 10],
                                    fontSize: 10
                                });

                                var SupplierDoc = 'Supplier Document: EU Quality. UK. EW. 127129. Patch Plants Ltd. \n';
                                SupplierDoc += 'ID: ' + order.OrderID + ' Printed: ' + order.PrintedDate + '.';
                                SupplierDoc += row.UKPlantPassportA != null && row.UKPlantPassportA != '' ? row.UKPlantPassportA + '.' : '';
                                SupplierDoc += row.ItemTitle + '.' + row.Qty;

                                dataRow.push({
                                    text: SupplierDoc, fontSize: 10,
                                    margin: [0, 10, 0, 10]
                                });

                                body.push(dataRow);
                            });

                            var marginForNotes = (order.DeliveryNote != '' && order.DeliveryNote != null) || (order.GiftNote != '' && order.GiftNote != null) ? [0, 0, 0, 20] : [160, 0, 0, 0];

                            // ADD page to doc definition
                            var newContent = [
                                // PATCH with logotype.
                                {
                                    columns:
                                        [
                                            {
                                                image: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAOgAAADICAYAAADiBa1OAAAgAElEQVR4Xu19XcxtVXnuarzTUL1wK4ct3mgTi7E09ULbHESbnB5MtMXdi03x29ycWgMbSDRGNpoImCgbYyQBNsZqb2AfWk4iWCGBtsmpyMkpXNjUNiKJcrMVDgUvpKTeGU+eSZ7ls57vfccYc64511of35w3e39rzjnm+Hmf8f6M9+c3fvWrX/1qsYXrl7/85eI1r3lN92X8H5f+zf9voWsH4pND5s/n+UAM9JB38je2BdAMmArUQ7421eG//PLLi9e+9rXhxhaBkb/Nc1yd2p15YGsAVQ6gszHv8sNowznqLIEMm8dde2trAC2BMgPvrk3etvoTcUL/LZrDeV63tWLDv7tVgIJgfvGLX3Riml7z7l9fUIJN5xDzpr/r31Qp/Lf6l+YntjkDWwHoLMaOv+TQR8+dO7d48cUXF0eOHFm84x3vSI1uMycdf/6nanErANXd/Nlnf7r40Y9+vHjuuecWF1988eKtb33r4rzzzptqvK+qdgFKztVtt922OH369AK/XXDB+YvTp7+0OH78eAdS56qvqkl4lQ9mawDFvP7gBz9YPPzww4szZ+5cPPfc84s//dNji6uvvmbx/ve//1U+7eMO77777lvceusXFz/84dMdYAHSSy75r4u77jqzeOc737n82Mw5x533TbQ2OUBVnNX/g3PedtuXFvfee29HULx++7ffsbjxxs8sd3/+ftiIK+N6yjXxzNNPP7249tqTi8cf/z/76AUgPXv27OL88//LUtzV9zdBYPM31puByQBK4wVFMCU4ENXnP3/L4u///h9WwMmhQEQ7efK6xTXXXLMi7h42Ua12dIJN7pOf/OTim998YMk5lRww9ydOnFh84QtfmNWG9XCytbcnA6jqmfr/73znO4uvfvXujqhKFzjp3t6JJUjJfWH1PSw6qnNLtW7j3t1337347Gc/200jRVvOKf/Gv2fOnOkkElyzFXdrWBv04ckA6scAIBSA85Zbbg7FMSUw/h+c9PLLjy1uuOHTi6NH37I0dgwa6QF+KTo6uf/++xenTn26090VjL/7uxcv/uVfvr9Pbbjzzrs63f6wqQoHeNm7rk8KUO7Y2O0feuihFUMG7pFDQAw7evTo4tFHH9kHXoppH//4x5cGj8NAZCVHA2x01113bWcU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',
                                                width: 25,
                                                height: 18,
                                                margin: marginForNotes
                                            },
                                            {
                                                text: 'PATCH',
                                                bold: true,
                                                fontSize: 18,
                                                margin: marginForNotes
                                            }
                                        ],
                                    // optional space between columns
                                    columnGap: 9
                                },
                                // PATCH ORDER Data
                                {
                                    columns: [
                                        [{
                                            text: 'Ship to',
                                            fontSize: 10,
                                            bold: true
                                        },
                                        {
                                            fontSize: 10, text: order.ShipTo
                                        },
                                        {
                                            text: 'Printed date',
                                            fontSize: 10,
                                            bold: true
                                        },
                                        {
                                            text: order.PrintedDate,
                                            fontSize: 10,
                                            style: 'sectionShipping'
                                        }],

                                        [{
                                            text: 'UK Plant passport',
                                            fontSize: 10,
                                            bold: true
                                        },
                                        {
                                            fontSize: 10,
                                            text: 'B: GB-' + order.UKPlantPassportB
                                        },
                                        {
                                            text: 'C: ' + order.UKPlantPassportC,
                                            fontSize: 10,
                                            style: 'sectionShipping'
                                        }],

                                        [{
                                            text: [{ text: 'Carrier: ', bold: true }, { text: order.CarrierName, bold: false }],
                                            fontSize: 10,
                                            bold: true
                                        },
                                        {
                                            text: [
                                                {
                                                    text: 'Box type: ',
                                                    bold: true
                                                },
                                                {
                                                    text: order.BoxType != '' && order.BoxType != null ? order.BoxType : '',
                                                    bold: false
                                                }],
                                            fontSize: 10,
                                            bold: true
                                        },
                                        {
                                            text: [
                                                {
                                                    text: 'Pallet group: ',
                                                    bold: true
                                                },
                                                {
                                                    text: order.PalletGroup != '' && order.PalletGroup != null ? order.PalletGroup : '',
                                                    bold: false
                                                }],
                                            bold: true,
                                            fontSize: 10,
                                            style: 'sectionShipping'
                                        }],

                                        // Barcode...
                                        [
                                            {
                                                text: order.OrderID,
                                                bold: true,
                                                fontSize: 10,
                                                alignment: 'center'
                                            },
                                            {
                                                image: $scope.textToBarCodeBase64(order.OrderID),
                                                width: 85,
                                                height: 18,
                                                alignment: 'center'
                                            },
                                            {
                                                text: 'Parcel ' + (index + 1).toString() + ' of ' + order.Packages.length.toString(),
                                                bold: true,
                                                alignment: 'center',
                                                fontSize: 9,
                                                style: 'sectionShipping'
                                            }
                                        ]
                                    ]
                                },
                                // ORDER ITEMS
                                {
                                    table: {
                                        headerRows: 1,
                                        widths: [65, '*', 31, '*', 140],
                                        body: body
                                    },
                                    layout: {
                                        //defaultBorder: false,
                                        fillColor: function (rowIndex, node, columnIndex) {
                                            return (rowIndex == 0) ? '#f5f2ed' : null;
                                        },
                                        hLineColor: function (i, node) {
                                            return (i === 0 || i === node.table.body.length) ? '#808080' : 'white';
                                        },
                                        hLineWidth: function (i, node) {
                                            return (i === 0 || i === node.table.body.length) ? 1 : 0;
                                        },
                                        vLineWidth: function (i, node) {
                                            return (i === 0 || i === node.table.widths.length) ? 1 : 0;
                                        }
                                    }
                                }];


                            // if this is not last package add new page.
                            if (pkg != order.Packages[order.Packages.length - 1]) {
                                var pagebreak = {
                                    text: '',
                                    pageBreak: "after"
                                };

                                newContent.push(pagebreak);
                            }
                            else {
                                // ADD footer on the last page
                                newContent.push({
                                    canvas:
                                        [
                                            { type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, color: '#808080', lineWidth: 0.5 }
                                        ], margin: [0, 10, 0, 10]
                                });

                                newContent.push({
                                    "text": [
                                        {
                                            "text": "Thanks for shopping with Patch",
                                            bold: true,
                                            "alignment": "center"
                                        }
                                    ],
                                    margin: [0, 0, 0, 5]
                                });

                                newContent.push({
                                    "text": [
                                        {
                                            "text": "If you have any questions, send us an email at: help@patchplants.com",
                                            "alignment": "center"
                                        }
                                    ], margin: [0, 0, 0, 5]
                                });
                            }


                            // We need to show notes only on the 1st page.
                            if (pkg == order.Packages[0]) {
                                docDefinition.content.push(
                                    // Hello driver
                                    {
                                        columns: [
                                            [
                                                {
                                                    text: (order.DeliveryNote != '' && order.DeliveryNote != null) || (order.GiftNote != '' && order.GiftNote != null) ? 'Hello driver' : '', bold: true,
                                                    fontSize: 18
                                                }
                                            ]
                                        ]
                                    });

                                docDefinition.content.push(
                                    // Notes...
                                    {
                                        columns: [
                                            [{
                                                text: (order.DeliveryNote != '' && order.DeliveryNote != null) ? order.DeliveryNote : '',
                                                maxHeight: 600,
                                                width: 272,
                                                height: 159,
                                                margin: [0, 10, 0, 15]
                                            }],
                                            [{
                                                text: (order.GiftNote != '' && order.GiftNote != null) ? order.GiftNote : '',
                                                width: 272,
                                                height: 159,
                                                margin: [20, 10, 0, 15]
                                            }]
                                        ]
                                    });
                            }

                            docDefinition.content.push(newContent);
                        }
                    }

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
