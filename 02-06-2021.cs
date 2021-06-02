using LinnworksMacroHelpers.Classes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace LinnworksMacro
{
    public class MacroAPIToGetInvoiceData : LinnworksMacroHelpers.LinnworksMacroBase
    {
        public List<OrderVM> Execute(Guid[] orderIds)
        {
            try
            {
                Logger.WriteInfo("Macro started");

                List<OrderVM> result = new List<OrderVM>();

                var orders = Api.Orders.GetOrdersById(orderIds.ToList());

                foreach (var order in orders)
                {
                    Logger.WriteInfo("Get data for order " + order.NumOrderId + "...");

                    OrderVM newOrder = new OrderVM();

                    // === Order common data
                    var DeliveryNote = order.Notes.FirstOrDefault(x => x.Note.StartsWith("DN:"));
                    var GiftNote = order.Notes.FirstOrDefault(x => x.Note.StartsWith("GN:"));

                    newOrder.OrderID = Convert.ToString(order.NumOrderId);
                    newOrder.DeliveryNote = DeliveryNote != null ? DeliveryNote.Note.Substring(3) : "";
                    newOrder.GiftNote = GiftNote != null ? GiftNote.Note.Substring(3) : "";

                    newOrder.ShipmentNumber = Convert.ToString(order.NumOrderId);

                    newOrder.UKPlantPassportB = "127139";
                    newOrder.UKPlantPassportC = Convert.ToString(order.NumOrderId);

                    newOrder.BoxType = order.ShippingInfo.PackageType;

                    newOrder.CarrierName = order.ShippingInfo.PostalServiceName;

                    var orderProps = Api.Orders.GetExtendedProperties(order.OrderId);
                    var palletGroup = orderProps.FirstOrDefault(x => x.Name == "pallet_sort_expected");
                    newOrder.PalletGroup = palletGroup != null ? palletGroup.Value : "";

                    newOrder.ShipTo = order.CustomerInfo.Address.PostCode;

                    // === Order items data
                    var t = Api.Orders.GetOrderPackagingCalculation(new LinnworksAPI.GetOrderPackagingCalculationRequest
                    {
                        pkOrderIds = new Guid[] { order.OrderId },
                        Recalculate = false,
                        SaveRecalculation = false
                    });

                    newOrder.Items = new List<OrderItemVM>();

                    foreach (var item in order.Items)
                    {
                        var newItem = new OrderItemVM();

                        newItem.SKU = item.SKU;
                        newItem.ItemTitle = item.Title;
                        newItem.CategoryName = item.CategoryName;
                        newItem.Qty = item.Quantity;

                        // Extended properties
                        var props = Api.Inventory.GetInventoryItemExtendedProperties(item.StockItemId, null);

                        var country_of_original = props.FirstOrDefault(x => x.ProperyName == "country_of_original");
                        newItem.CountryOfOriginal = country_of_original != null ? country_of_original.PropertyValue : "";
                        newItem.UKPlantPassportD = country_of_original != null ? country_of_original.PropertyValue : "";

                        var customs_name = props.FirstOrDefault(x => x.ProperyName == "customs_name");
                        newItem.UKPlantPassportA = customs_name != null ? customs_name.PropertyValue : "";

                        var patch_name = props.FirstOrDefault(x => x.ProperyName == "patch_name");
                        newItem.PatchName = patch_name != null ? patch_name.PropertyValue : "";

                        // Suppler Code
                        var suppliers = Api.Inventory.GetStockSupplierStat(item.StockItemId);

                        if (suppliers != null && suppliers.Count > 0)
                        {
                            var defSupplier = suppliers.FirstOrDefault(x => x.IsDefault);

                            newItem.SupplierDoc = defSupplier != null ? defSupplier.Supplier : suppliers.First().Supplier;
                        }

                        // Image
                        var images = Api.Inventory.GetInventoryItemImages(item.StockItemId);

                        if (images != null && images.Count > 0)
                        {
                            newItem.ImageSource = images[0].Source;

                            newItem.ImageBase64 = GetBase64(images[0].Source);
                        }

                        newOrder.Items.Add(newItem);
                    }

                    result.Add(newOrder);
                }

                return result;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public string GetBase64(string imageURL)
        {
            try
            {
                var request = new ProxiedWebRequest()
                {
                    Url = imageURL,
                    Method = "GET"
                };

                request.Validate();

                Logger.WriteInfo("Sending request to get image ...");
                var response = ProxyFactory.WebRequest(request);

                string fileString = response.GetStringResponse();

                var bytes = Encoding.UTF8.GetBytes(fileString);

                string base64 = Convert.ToBase64String(bytes);

                return base64;
            }
            catch (Exception e)
            {
                Logger.WriteError(e.Message);

                return "";
            }
        }

        public class OrderVM
        {
            public string OrderID { get; set; } = "";

            public string DeliveryNote { get; set; } = "";

            public string GiftNote { get; set; } = "";

            public string ShipTo { get; set; } = "";

            public string PrintedDate { get; set; } = DateTime.Now.ToString("ddd dd MMM yyyy");

            public string ShipmentNumber { get; set; }

            public string UKPlantPassportB { get; set; }

            public string UKPlantPassportC { get; set; }

            public string BoxType { get; set; }

            public string PalletGroup { get; set; }

            public string CarrierName { get; set; }

            public List<OrderItemVM> Items { get; set; }
        }

        public class PackageVM
        {
            public List<OrderItemVM> items { get; set; }
        }

        public class OrderItemVM
        {
            public string SKU { get; set; }

            public string ItemTitle { get; set; }

            public string PatchName { get; set; }

            public int Qty { get; set; }

            public string SupplierDoc { get; set; }

            public string ImageSource { get; set; }

            public string ImageBase64 { get; set; } = "";

            public string UKPlantPassportA { get; set; }

            public string UKPlantPassportD { get; set; }

            public string CountryOfOriginal { get; set; }

            public string CategoryName { get; set; }
        }
    }
}
