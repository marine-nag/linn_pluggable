using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using LinnworksAPI;

namespace LinnworksMacro
{
    public class LinnworksMacro : LinnworksMacroHelpers.LinnworksMacroBase
    {
        public List<string> Execute(Guid[] orderIds)
        {
            try
            {
                Logger.WriteInfo("Macro started");

                foreach(var item in orderIds)
                {
                    Logger.WriteInfo("Order : " + item);
                }

                return new List<string>(){ "Good!"};
            } 
            catch(Exception ex) {
                return new List<string>(){ "Bad!"};
            } 
        }
    }
}
