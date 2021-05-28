var PlaceHolder = function ($scope, $element) {
    console.log("roos placeholder works 183 - fixed parent non-tracked items, in this case only tracked child level used");
    this.getItems = function () {
        var items = [{
            text: "Remove Out Of Stock",
            key: "RemoveOutOfStockButton",
            icon: "fa fa-minus-circle"
        }];
        return items;
    }
    this.isEnabled = function (itemKey) {
        return true;
    }
    const dialogs = require("core/dialogs");
    const busyWorker = require("core/busyWorker/busyWorker");
    const wind = require('core/Window');
    this.onClick = function () {
        $scope.ItemsToRemove = [];
        $scope.order.Items.forEach(item => {
            // if (item.Level > 0 && (item.CompositeSubItems && item.CompositeSubItems.length > 0)) {
            //     return;
            // }
            // else if (item.AvailableStock <= 0 && item.OnOrder <= 0) {
                if (item.CompositeSubItems && item.CompositeSubItems.length > 0) {
                    let unavailableSubitemsAmount = 0;
                    item.CompositeSubItems.forEach(subitem => {
                        if ((subitem.AvailableStock + subitem.OnOrder) < subitem.Quantity) {
                            unavailableSubitemsAmount++;
                        }
                    })
                    if (unavailableSubitemsAmount > 0) {
                        $scope.ItemsToRemove.push(item);
                    }
                }
                if (((item.AvailableStock + item.OnOrder) < item.Quantity) && item.MinimumLevel != -1 && (item.CompositeSubItems.length == 0) )  {
                    $scope.ItemsToRemove.push(item);
                }
        });
        if ($scope.ItemsToRemove.length < 1) {
            Core.Dialogs.addNotify("No items to remove", "WARNING");
            return;
        }
        var win = new wind({
            moduleName: "RemoveOutOfStock",
            windowName: "RemoveOutOfStock",
            title: "Confirmation - this items will be deleted from order",
            closeOnEscape: false,
            closeOnBackDrop: false,
            data: { ItemsToRemove: $scope.ItemsToRemove },
            onWindowClosed: function (event) {
                switch (event.action) {
                    case "YES":
                        // $scope.CheckHasChanged();
                        // if (!$scope.$$phase) {
                        //     $scope.$apply();
                        // }
                        $scope.removeOutOfStock();
                        break;
                    case "NO":
                        if (event.result) {
                            // $scope.CheckHasChanged();
                            // if (!$scope.$$phase) {
                            //     $scope.$apply();
                            // }
                        }
                        break;
                }
            },
            width: "900px"
        });
        win.open();
    }
    $scope.ItemsToRemove = [];
    $scope.removeOutOfStock = function () {
        busyWorker.showBusy($element.find(".itemsTableContainer"), "Updating");
        $scope.amountProcessed = 0;
        $scope.order.Items.forEach(item => {
            var service = new Services.OrdersService(self.options);
            if ($scope.ItemsToRemove.includes(item)) {
                $scope.amountProcessed++;
                service.removeOrderItem($scope.order.OrderId, item.RowId, $scope.locationId, function (event) {
                    if (event.hasErrors() == false) {
                        for (var i = 0; i < $scope.order.Items.length; i++) {
                            if ($scope.order.Items[i].RowId == item.RowId) {
                                $scope.order.Items.splice(i, 1);
                                item = null;
                                break;
                            }
                        }
                        $scope.saveOrderPackagingCalculation(true, false, function () {
                            $scope.updateTotalsInfo(event.result);
                        });
                        $scope.updateTotalsInfo(event.result);
                    } else {
                        dialogs.addNotify(event.error.errorMessage, "ERROR");
                    }
                    $scope.$apply();
                });
            }
        });
        if ($scope.amountProcessed > 0) {
            Core.Dialogs.addNotify("Items succesfully removed", "SUCCESS");
        }
        else {
            Core.Dialogs.addNotify("No items to remove", "WARNING");
        }
        busyWorker.hideBusy($element.find(".itemsTableContainer"));
    };
}
Core.PlaceHolderManager.register("OpenOrder_EditOrder_ItemsButtons", PlaceHolder)
Core.PlaceHolderManager.register("OpenOrder_EditOrder_OrderControlButtons", PlaceHolder);
Core.PlaceHolderManager.register({
    moduleName: "MyInventory",
    placeHolderName: "MyInventory_RightTopButtons"
}, PlaceHolder);
Core.PlaceHolderManager.register({
    moduleName: "MyInventory",
    placeHolderName: "MyInventory_EditInventoryItemView"
}, PlaceHolder);
