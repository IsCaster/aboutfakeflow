using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Drawing.Design;
using System.Globalization;
using System.Linq;
using HighVoltz.Dynamic;
using Styx;
using Styx.Helpers;
using Styx.WoWInternals;
using Styx.WoWInternals.WoWObjects;
using Styx.TreeSharp;


// use by SellJunkItemAction
using Styx.CommonBot.Database;
using Styx.CommonBot.Frames;



namespace HighVoltz.Composites
{
    public sealed class GetGrayItemfromBankAction : PBAction
    {
        // number of times the recipe will be crafted
        // call after GetItemfromBankAction
        #region BankWithdrawlItemType enum

        public enum BankWithdrawlItemType
        {
            SpecificItem,
            Materials,
        }

        #endregion

        private const long GbankItemThrottle = 1000;

        private const string WithdrawItemFromGBankLuaFormat = @"
            local tabnum = GetNumGuildBankTabs()  
            local bagged = 0  
            local sawItem = 0   
            for tab = 1,tabnum do  
               local _,_,iv,_,nw, rw = GetGuildBankTabInfo(tab)   
               if iv and (nw > 0 or nw == -1) and (rw == -1 or rw > 0) then  
                  SetCurrentGuildBankTab(tab)  
                  for slot = 1, 98 do  
                     local _,c,l=GetGuildBankItemInfo(tab, slot)  
                     local id = tonumber(string.match(GetGuildBankItemLink(tab, slot) or '','|Hitem:(%d+)'))
                     local bJunk=false
                     if id ~= nil then
                        _, _, quality, iLevel, reqLevel, _, _, _, _, _, _=GetItemInfo(id)
                        if quality == 0 or ( reqLevel >= 83 and reqLevel <= 90  and quality == 2 and iLevel >= 364 and iLevel <= 437 ) then
                            bJunk=true
                        end
                     end
                     if l == nil and c > 0 and bJunk then  
                        sawItem = 1  
                        AutoStoreGuildBankItem(tab, slot)  
                        return c  
                     end  
                  end  
               end  
            end  
            if sawItem == 0 then return -1 else return bagged end   
";
        // thanks to Stove for fixing problem with PutItemInBag not working - http://www.thebuddyforum.com/members/134034-stove.html 

        private const string WithdrawItemFromPersonalBankLuaFormat = @"
            local numSlots = GetNumBankSlots()  
            local splitUsed = 0  
            local bagged = 0  
            local amount = {1}  
            local itemID = {0}  
            local bag1 = numSlots + 4   
            while bag1 >= -1 do  
               if bag1 == 4 then  
                  bag1 = -1  
               end  
               for slot1 = 1, GetContainerNumSlots(bag1) do  
                  local _,c,l=GetContainerItemInfo(bag1, slot1)  
                  local id = GetContainerItemID(bag1,slot1)  
                  if l ~= 1 and c and c > 0 and (id == itemID or itemID == 0) then  
                     if c + bagged <= amount  then  
                        UseContainerItem(bag1,slot1)  
                        bagged = bagged + c  
                     else  
                        local itemf  = GetItemFamily(id)  
                        for bag2 = 0,4 do  
                           local fs,bfamily = GetContainerNumFreeSlots(bag2)  
                           if fs > 0 and (bfamily == 0 or bit.band(itemf, bfamily) > 0) then  
                              local freeSlots = GetContainerFreeSlots(bag2)  
                              SplitContainerItem(bag1,slot1,amount - bagged)  
                              if bag2 == 0 then PutItemInBackpack() else 
					            slotTable=GetContainerFreeSlots(bag2) 
					            first=slotTable[1] 
					            PickupContainerItem(bag2, first)
					          end  
                              return  
                           end  
                           bag2 = bag2 -1  
                        end  
                     end  
                     if bagged >= amount then return end  
                  end  
               end  
               bag1 = bag1 -1  
            end";
      

        private static Stopwatch _queueServerSW;
        private readonly Stopwatch _gbankItemThrottleSW = new Stopwatch();
        private Stopwatch _itemsSW;
        private WoWPoint _loc;

        public GetGrayItemfromBankAction()
        {
            Properties["Amount"] = new MetaProp("Amount", typeof (DynamicProperty<int>),
                                                new TypeConverterAttribute(
                                                    typeof (DynamicProperty<int>.DynamivExpressionConverter)),
                                                new DisplayNameAttribute(Pb.Strings["Action_Common_Amount"]));

            Properties["MinFreeBagSlots"] = new MetaProp("MinFreeBagSlots", typeof (uint),
                                                         new DisplayNameAttribute(
                                                             Pb.Strings["Action_Common_MinFreeBagSlots"]));

            Properties["GetItemfromBankType"] = new MetaProp("GetItemfromBankType",
                                                             typeof (BankWithdrawlItemType),
                                                             new DisplayNameAttribute(
                                                                 Pb.Strings["Action_Common_ItemsToWithdraw"]));

            Properties["Bank"] = new MetaProp("Bank", typeof (BankType),
                                              new DisplayNameAttribute(Pb.Strings["Action_Common_Bank"]));

            Properties["AutoFindBank"] = new MetaProp("AutoFindBank", typeof (bool),
                                                      new DisplayNameAttribute(Pb.Strings["Action_Common_AutoFindBank"]));

            Properties["Location"] = new MetaProp("Location", typeof (string),
                                                  new EditorAttribute(typeof (PropertyBag.LocationEditor),
                                                                      typeof (UITypeEditor)),
                                                  new DisplayNameAttribute(Pb.Strings["Action_Common_Location"]));

            Properties["NpcEntry"] = new MetaProp("NpcEntry",
                                                  typeof (uint),
                                                  new EditorAttribute(typeof (PropertyBag.EntryEditor),
                                                                      typeof (UITypeEditor)),
                                                  new DisplayNameAttribute(Pb.Strings["Action_Common_NpcEntry"]));

            Properties["WithdrawAdditively"] = new MetaProp("WithdrawAdditively", typeof (bool),
                                                            new DisplayNameAttribute(
                                                                Pb.Strings["Action_Common_WithdrawAdditively"]));

            Properties["Withdraw"] = new MetaProp("Withdraw", typeof (DepositWithdrawAmount),
                                                  new DisplayNameAttribute(Pb.Strings["Action_Common_Withdraw"]));

            Amount = new DynamicProperty<int>("Amount", this, "1");
            MinFreeBagSlots = 2u;
            GetItemfromBankType = BankWithdrawlItemType.SpecificItem;
            Bank = BankType.Personal;
            AutoFindBank = true;
            _loc = WoWPoint.Zero;
            Location = _loc.ToInvariantString();
            NpcEntry = 0u;
            WithdrawAdditively = true;
            Withdraw = DepositWithdrawAmount.All;

            Properties["Location"].Show = false;
            Properties["NpcEntry"].Show = false;
            Properties["Amount"].Show = false;

            Properties["AutoFindBank"].PropertyChanged += AutoFindBankChanged;
            Properties["GetItemfromBankType"].PropertyChanged += GetGrayItemfromBankActionPropertyChanged;
            Properties["Location"].PropertyChanged += LocationChanged;
            Properties["Withdraw"].PropertyChanged += WithdrawChanged;
        }

        #region Callbacks

        private void WithdrawChanged(object sender, MetaPropArgs e)
        {
            Properties["Amount"].Show = Withdraw == DepositWithdrawAmount.Amount;
            RefreshPropertyGrid();
        }

        private void LocationChanged(object sender, MetaPropArgs e)
        {
            _loc = Util.StringToWoWPoint((string) ((MetaProp) sender).Value);
            Properties["Location"].PropertyChanged -= LocationChanged;
            Properties["Location"].Value = string.Format(CultureInfo.InvariantCulture, "{0}, {1}, {2}", _loc.X, _loc.Y, _loc.Z);
            Properties["Location"].PropertyChanged += LocationChanged;
            RefreshPropertyGrid();
        }

        private void AutoFindBankChanged(object sender, MetaPropArgs e)
        {
            if (AutoFindBank)
            {
                Properties["Location"].Show = false;
                Properties["NpcEntry"].Show = false;
            }
            else
            {
                Properties["Location"].Show = true;
                Properties["NpcEntry"].Show = true;
            }
            RefreshPropertyGrid();
        }

        private void GetGrayItemfromBankActionPropertyChanged(object sender, MetaPropArgs e)
        {
            switch (GetItemfromBankType)
            {
                case BankWithdrawlItemType.SpecificItem:
                    Properties["Amount"].Show = true;
                    Properties["WithdrawAdditively"].Show = true;
                    break;
                case BankWithdrawlItemType.Materials:
                    Properties["Amount"].Show = false;
                    Properties["WithdrawAdditively"].Show = false;
                    break;
            }
            RefreshPropertyGrid();
        }

        #endregion

        [PbXmlAttribute]
        public DepositWithdrawAmount Withdraw
        {
            get { return (DepositWithdrawAmount) Properties["Withdraw"].Value; }
            set { Properties["Withdraw"].Value = value; }
        }

        [PbXmlAttribute]
        public BankType Bank
        {
            get { return (BankType) Properties["Bank"].Value; }
            set { Properties["Bank"].Value = value; }
        }

        [PbXmlAttribute]
        public uint MinFreeBagSlots
        {
            get { return (uint) Properties["MinFreeBagSlots"].Value; }
            set { Properties["MinFreeBagSlots"].Value = value; }
        }

        [PbXmlAttribute]
        public BankWithdrawlItemType GetItemfromBankType
        {
            get { return (BankWithdrawlItemType) Properties["GetItemfromBankType"].Value; }
            set { Properties["GetItemfromBankType"].Value = value; }
        }

        [PbXmlAttribute]
        public uint NpcEntry
        {
            get { return (uint) Properties["NpcEntry"].Value; }
            set { Properties["NpcEntry"].Value = value; }
        }

        [PbXmlAttribute]
        [TypeConverter(typeof (DynamicProperty<int>.DynamivExpressionConverter))]
        public DynamicProperty<int> Amount
        {
            get { return (DynamicProperty<int>) Properties["Amount"].Value; }
            set { Properties["Amount"].Value = value; }
        }

        [PbXmlAttribute]
        public bool AutoFindBank
        {
            get { return (bool) Properties["AutoFindBank"].Value; }
            set { Properties["AutoFindBank"].Value = value; }
        }

        [PbXmlAttribute]
        public bool WithdrawAdditively
        {
            get { return (bool) Properties["WithdrawAdditively"].Value; }
            set { Properties["WithdrawAdditively"].Value = value; }
        }

        [PbXmlAttribute]
        public string Location
        {
            get { return (string) Properties["Location"].Value; }
            set { Properties["Location"].Value = value; }
        }

        public override string Name
        {
            get { return Pb.Strings["Action_GetItemFromBankAction_Name"]; }
        }

        public override string Title
        {
            get
            {
                return string.Format("{0}: " + (GetItemfromBankType == BankWithdrawlItemType.SpecificItem
                                                    ? " {1} {2}"
                                                    : ""), Name, "10241024", Amount);
                // unknown staff
            }
        }

        public override string Help
        {
            get { return Pb.Strings["Action_GetItemFromBankAction_Help"]; }
        }

        protected override RunStatus Run(object context)
        {
            //Professionbuddy.Log("GetGrayItemfromBankAction.Run()");
            if (!IsDone)
            {
                if ((Bank == BankType.Guild && !Util.IsGBankFrameOpen) ||
                    (Bank == BankType.Personal && !Util.IsBankFrameOpen))
                {
                    MoveToBanker();
                }
                else
                {
                    if (_itemsSW == null)
                    {
                        _itemsSW = new Stopwatch();
                        _itemsSW.Start();
                    }
                    else if (_itemsSW.ElapsedMilliseconds < Util.WowWorldLatency*3)
                        return RunStatus.Success;
                    /*if (_itemList == null)
                        _itemList = BuildItemList();*/
                    // no bag space... 
                    //itemid:6948 is the hearth stone
                    if (Util.BagRoomLeft(6948) <= MinFreeBagSlots )
                    {
                        IsDone = true;
                        Professionbuddy.Log("Done withdrawing all items from {0} Bank", Bank);
                    }
                    else
                    {
                        if (Bank == BankType.Personal)
                        {
                            //to do
                            return RunStatus.Failure;
                        }    
                        else
                        {
                            // throttle the amount of items being withdrawn from gbank per sec
                            if (!_gbankItemThrottleSW.IsRunning)
                            {
                                _gbankItemThrottleSW.Start();
                            }
                            if (_gbankItemThrottleSW.ElapsedMilliseconds < GbankItemThrottle)
                            {
                                //Professionbuddy.Log("GetGrayItemfromBankAction.Run() ElapsedMilliseconds= {0}" , _gbankItemThrottleSW.ElapsedMilliseconds);
                                return RunStatus.Success;
                            }
                            //Professionbuddy.Log("GetGrayItemfromBankAction.Run() 3");
                            int ret = GetItemFromGBank();
                            if (ret >= 0)
                            {
                                _gbankItemThrottleSW.Reset();
                                _gbankItemThrottleSW.Start();
                            }
                            else
                            {
                                Professionbuddy.Log("GetGrayItemfromBankAction. done");
                                return RunStatus.Failure;
                            }
                        }
                    }
                    _itemsSW.Reset();
                    _itemsSW.Start();
                }
                return RunStatus.Success;
            }
            return RunStatus.Failure;
        }

        private WoWObject GetLocalBanker()
        {
            WoWObject bank = null;
            List<WoWObject> bankers;
            if (Bank == BankType.Guild)
                bankers = (from banker in ObjectManager.ObjectList
                           where
                               (banker is WoWGameObject &&
                                ((WoWGameObject) banker).SubType == WoWGameObjectType.GuildBank) ||
                               (banker is WoWUnit && ((WoWUnit) banker).IsGuildBanker && ((WoWUnit) banker).IsAlive &&
                                ((WoWUnit) banker).CanSelect)
                           select banker).ToList();
            else
                bankers = (from banker in ObjectManager.ObjectList
                           where (banker is WoWUnit &&
                                  ((WoWUnit) banker).IsBanker &&
                                  ((WoWUnit) banker).IsAlive &&
                                  ((WoWUnit) banker).CanSelect)
                           select banker).ToList();

            if (!AutoFindBank && NpcEntry != 0)
                bank = bankers.Where(b => b.Entry == NpcEntry).OrderBy(o => o.Distance).FirstOrDefault();
            else if (AutoFindBank || _loc == WoWPoint.Zero || NpcEntry == 0)
                bank = bankers.OrderBy(o => o.Distance).FirstOrDefault();
            else if (StyxWoW.Me.Location.Distance(_loc) <= 90)
            {
                bank = bankers.Where(o => o.Location.Distance(_loc) < 10).
                    OrderBy(o => o.Distance).FirstOrDefault();
            }
            return bank;
        }

        private void MoveToBanker()
        {
            WoWPoint movetoPoint = _loc;
            WoWObject bank = GetLocalBanker();
            if (bank != null)
                movetoPoint = WoWMathHelper.CalculatePointFrom(Me.Location, bank.Location, 3);
                // search the database
            else if (movetoPoint == WoWPoint.Zero)
            {
                movetoPoint =
                    MoveToAction.GetLocationFromDB(
                        Bank == BankType.Personal
                            ? MoveToAction.MoveToType.NearestBanker
                            : MoveToAction.MoveToType.NearestGB, NpcEntry);
            }
            if (movetoPoint == WoWPoint.Zero)
            {
                IsDone = true;
                Professionbuddy.Err(Pb.Strings["Error_UnableToFindBank"]);
            }
            if (movetoPoint.Distance(StyxWoW.Me.Location) > 4)
            {
                Util.MoveTo(movetoPoint);
            }
                // since there are many personal bank replacement addons I can't just check if frame is open and be generic.. using events isn't reliable
            else if (bank != null)
            {
                bank.Interact();
            }
            else
            {
                IsDone = true;
                Professionbuddy.Err(Pb.Strings["Error_UnableToFindBank"]);
            }
        }


        // indexes are {0} = ItemID, {1} = amount to deposit

        /// <summary>
        /// Withdraws gray items from gbank
        /// </summary>
        /// <returns>the amount withdrawn.</returns>
        public int GetItemFromGBank( )
        {
            if (_queueServerSW == null)
            {
                _queueServerSW = new Stopwatch();
                _queueServerSW.Start();
                //call after GetItemfromBankAction so remove this
                //Lua.DoString("for i=GetNumGuildBankTabs(), 1, -1 do QueryGuildBankTab(i) end ");
                Professionbuddy.Log("NOT Queuing server for gbank info");
                return 0;
            }
            if (_queueServerSW.ElapsedMilliseconds < 2000)
            {
                return 0;
            }
            //string lua = string.Format(WithdrawItemFromGBankLuaFormat, id, amount);
            string lua = WithdrawItemFromGBankLuaFormat;
            var retVal = Lua.GetReturnVal<int>(lua, 0);
            // -1 means no item was found.
            if (retVal == -1)
            {
                Professionbuddy.Log("No Gray/junk items could be found in gbank");
            }
            return retVal;
        }

        // indexes are {0} = ItemID, {1} = amount to deposit

        public bool GetItemFromBank(uint id, int amount)
        {
            string lua = string.Format(WithdrawItemFromPersonalBankLuaFormat, id, amount);
            Lua.DoString(lua);
            return true;
        }

        public override void Reset()
        {
            base.Reset();
            _queueServerSW = null;
            _itemsSW = null;
        }

        public override object Clone()
        {
            return new GetGrayItemfromBankAction
                       {
                           Amount = Amount,
                           Bank = Bank,
                           GetItemfromBankType = GetItemfromBankType,
                           _loc = _loc,
                           AutoFindBank = AutoFindBank,
                           NpcEntry = NpcEntry,
                           Location = Location,
                           MinFreeBagSlots = MinFreeBagSlots,
                           WithdrawAdditively = WithdrawAdditively,
                           Withdraw = Withdraw
                       };
        }
    }
}


//SellJunkItemAction
namespace HighVoltz.Composites
{
    internal sealed class SellJunkItemAction : PBAction
    {
        #region SellJunkItemActionType enum

        public enum SellJunkItemActionType
        {
            Specific,
            Greys,
            Whites,
            Greens,
            Junk,
        }

        #endregion

        private uint _entry;
        private WoWPoint _loc;

        public SellJunkItemAction()
        {
            Properties["Location"] = new MetaProp("Location",
                                                  typeof (string),
                                                  new EditorAttribute(typeof (PropertyBag.LocationEditor),
                                                                      typeof (UITypeEditor)),
                                                  new DisplayNameAttribute(Pb.Strings["Action_Common_Location"]));

            Properties["NpcEntry"] = new MetaProp("NpcEntry", typeof (uint),
                                                  new EditorAttribute(typeof (PropertyBag.EntryEditor),
                                                                      typeof (UITypeEditor)),
                                                  new DisplayNameAttribute(Pb.Strings["Action_Common_NpcEntry"]));

            Properties["ItemID"] = new MetaProp("ItemID", typeof (string),
                                                new DisplayNameAttribute(Pb.Strings["Action_Common_ItemEntry"]));

            Properties["Count"] = new MetaProp("Count", typeof (DynamicProperty<int>),
                                               new TypeConverterAttribute(
                                                   typeof (DynamicProperty<int>.DynamivExpressionConverter)),
                                               new DisplayNameAttribute(Pb.Strings["Action_Common_Count"]));

            Properties["SellItemType"] = new MetaProp("SellItemType", typeof (SellJunkItemActionType),
                                                      new DisplayNameAttribute(
                                                          Pb.Strings["Action_SellItemAction_SellItemType"]));

            Properties["Sell"] = new MetaProp("Sell", typeof (DepositWithdrawAmount),
                                              new DisplayNameAttribute(Pb.Strings["Action_Common_Sell"]));

            ItemID = "";
            Count = new DynamicProperty<int>("Count", this, "0");
            _loc = WoWPoint.Zero;
            Location = _loc.ToInvariantString();
            NpcEntry = 0u;
            Sell = DepositWithdrawAmount.All;

            Properties["Location"].PropertyChanged += LocationChanged;
            Properties["SellItemType"].Value = SellJunkItemActionType.Specific;
            Properties["SellItemType"].PropertyChanged += SellJunkItemActionPropertyChanged;
            Properties["Sell"].PropertyChanged += SellChanged;
        }

        [PbXmlAttribute]
        public DepositWithdrawAmount Sell
        {
            get { return (DepositWithdrawAmount) Properties["Sell"].Value; }
            set { Properties["Sell"].Value = value; }
        }

        [PbXmlAttribute]
        public uint NpcEntry
        {
            get { return (uint) Properties["NpcEntry"].Value; }
            set { Properties["NpcEntry"].Value = value; }
        }

        [PbXmlAttribute]
        public string Location
        {
            get { return (string) Properties["Location"].Value; }
            set { Properties["Location"].Value = value; }
        }

        [PbXmlAttribute]
        public SellJunkItemActionType SellItemType
        {
            get { return (SellJunkItemActionType) Properties["SellItemType"].Value; }
            set { Properties["SellItemType"].Value = value; }
        }

        [PbXmlAttribute]
        public string ItemID
        {
            get { return (string) Properties["ItemID"].Value; }
            set { Properties["ItemID"].Value = value; }
        }

        [PbXmlAttribute]
        [TypeConverter(typeof (DynamicProperty<int>.DynamivExpressionConverter))]
        public DynamicProperty<int> Count
        {
            get { return (DynamicProperty<int>) Properties["Count"].Value; }
            set { Properties["Count"].Value = value; }
        }

        public override string Name
        {
            get { return Pb.Strings["Action_SellJunkItemAction_Name"]; }
        }

        public override string Title
        {
            get
            {
                return string.Format("({0}) " +
                                     (SellItemType == SellJunkItemActionType.Specific
                                          ? ItemID.ToString(CultureInfo.InvariantCulture) + " x{1} "
                                          : SellItemType.ToString()), Name, Count);
            }
        }

        public override string Help
        {
            get { return Pb.Strings["Action_SellJunkItemAction_Help"]; }
        }

        private void SellChanged(object sender, MetaPropArgs e)
        {
            Properties["Sell"].Show = Sell == DepositWithdrawAmount.Amount;
            RefreshPropertyGrid();
        }

        private void LocationChanged(object sender, MetaPropArgs e)
        {
            _loc = Util.StringToWoWPoint((string) ((MetaProp) sender).Value);
            Properties["Location"].PropertyChanged -= LocationChanged;
            Properties["Location"].Value = string.Format(CultureInfo.InvariantCulture, "{0}, {1}, {2}", _loc.X, _loc.Y, _loc.Z);
            Properties["Location"].PropertyChanged += LocationChanged;
            RefreshPropertyGrid();
        }

        private void SellJunkItemActionPropertyChanged(object sender, MetaPropArgs e)
        {
            switch (SellItemType)
            {
                case SellJunkItemActionType.Specific:
                    Properties["Count"].Show = true;
                    Properties["ItemID"].Show = true;
                    break;
                default:
                    Properties["Count"].Show = false;
                    Properties["ItemID"].Show = false;
                    break;
            }
            RefreshPropertyGrid();
        }

        protected override RunStatus Run(object context)
        {
            if (!IsDone)
            {
                if (MerchantFrame.Instance == null || !MerchantFrame.Instance.IsVisible)
                {
                    WoWPoint movetoPoint = _loc;
                    if (_entry == 0)
                        _entry = NpcEntry;
                    if (_entry == 0)
                    {
                        MoveToAction.GetLocationFromDB(MoveToAction.MoveToType.NearestVendor, 0);
                        NpcResult npcResults = NpcQueries.GetNearestNpc(StyxWoW.Me.FactionTemplate,
                                                                        StyxWoW.Me.MapId,
                                                                        StyxWoW.Me.Location, UnitNPCFlags.Vendor);
                        _entry = (uint) npcResults.Entry;
                        movetoPoint = npcResults.Location;
                    }
                    WoWUnit unit = ObjectManager.GetObjectsOfType<WoWUnit>().Where(o => o.Entry == _entry).
                        OrderBy(o => o.Distance).FirstOrDefault();
                    if (unit != null)
                        movetoPoint = unit.Location;
                    else if (movetoPoint == WoWPoint.Zero)
                        movetoPoint = MoveToAction.GetLocationFromDB(MoveToAction.MoveToType.NpcByID, NpcEntry);
                    if (movetoPoint != WoWPoint.Zero && StyxWoW.Me.Location.Distance(movetoPoint) > 4.5)
                    {
                        Util.MoveTo(movetoPoint);
                    }
                    else if (unit != null)
                    {
                        unit.Target();
                        unit.Interact();
                    }

                    if (GossipFrame.Instance != null && GossipFrame.Instance.IsVisible &&
                        GossipFrame.Instance.GossipOptionEntries != null)
                    {
                        foreach (GossipEntry ge in GossipFrame.Instance.GossipOptionEntries)
                        {
                            if (ge.Type == GossipEntry.GossipEntryType.Vendor)
                            {
                                GossipFrame.Instance.SelectGossipOption(ge.Index);
                                return RunStatus.Success;
                            }
                        }
                    }
                }
                else
                {
                    if (SellItemType == SellJunkItemActionType.Specific)
                    {
                        var idList = new List<uint>();
                        string[] entries = ItemID.Split(',');
                        if (entries.Length > 0)
                        {
                            foreach (string entry in entries)
                            {
                                uint itemID;
                                if (!uint.TryParse(entry.Trim(), out itemID))
                                {
                                    Professionbuddy.Err(Pb.Strings["Error_NotAValidItemEntry"], entry.Trim());
                                    continue;
                                }
                                idList.Add(itemID);
                            }
                        }
                        else
                        {
                            Professionbuddy.Err(Pb.Strings["Error_NoItemEntries"]);
                            IsDone = true;
                            return RunStatus.Failure;
                        }
                        List<WoWItem> itemList = StyxWoW.Me.BagItems.Where(u => idList.Contains(u.Entry)).
                            Take(Sell == DepositWithdrawAmount.All ? int.MaxValue : Count).ToList();
                        using (StyxWoW.Memory.AcquireFrame())
                        {
                            foreach (WoWItem item in itemList)
                                item.UseContainerItem();
                        }
                    }
                    else
                    {
                        List<WoWItem> itemList = null;
                        IEnumerable<WoWItem> itemQuery = from item in Me.BagItems
                                                         where !Pb.ProtectedItems.Contains(item.Entry)
                                                         select item;
                        switch (SellItemType)
                        {
                            case SellJunkItemActionType.Greys:
                                itemList = itemQuery.Where(i => i.Quality == WoWItemQuality.Poor).ToList();
                                break;
                            case SellJunkItemActionType.Whites:
                                itemList = itemQuery.Where(i => i.Quality == WoWItemQuality.Common).ToList();
                                break;
                            case SellJunkItemActionType.Greens:
                                itemList = itemQuery.Where(i => i.Quality == WoWItemQuality.Uncommon).ToList();
                                break;
                            case SellJunkItemActionType.Junk:
                                itemList = itemQuery.Where(i => i.Quality == WoWItemQuality.Uncommon && i.ItemInfo.Level >= 364 && i.ItemInfo.Level <= 437 && i.ItemInfo.RequiredLevel >= 83 && i.ItemInfo.RequiredLevel <= 90  ).ToList();
                                break;
                        }
                        if (itemList != null)
                        {
                            using (StyxWoW.Memory.AcquireFrame())
                            {
                                foreach (WoWItem item in itemList)
                                {
                                    item.UseContainerItem();
                                }
                            }
                        }
                    }
                    Professionbuddy.Log("SellJunkItemAction Completed for {0}", ItemID);
                    IsDone = true;
                }
                return RunStatus.Success;
            }
            return RunStatus.Failure;
        }

        public override void Reset()
        {
            base.Reset();
            _entry = 0;
        }

        public override object Clone()
        {
            return new SellJunkItemAction
                       {
                           Count = Count,
                           ItemID = ItemID,
                           SellItemType = SellItemType,
                           NpcEntry = NpcEntry,
                           Location = Location,
                           Sell = Sell
                       };
        }
    }
}