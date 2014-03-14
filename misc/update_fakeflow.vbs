# $language = "VBScript"
# $interface = "1.0"
' SendToAll.vbs

Sub Main()
   
    if Not crt.Session.Connected then
        szSession = crt.Dialog.Prompt("Enter session:", "", "", False)
        if szSession = "" then exit sub
    
        crt.Session.ConnectInTab("/S " & szSession)
        crt.Session.ConnectInTab("/S " & szSession)
        crt.Session.ConnectInTab("/S " & szSession)
    end if

    ' Find out what should be sent to all tabs
    ' szIp = crt.Dialog.Prompt("Enter IP to be added in the whitelist", _
    '                               "White List IP", "", False)
    ' if szIp = "" then exit sub
    
    'If crt.Dialog.MessageBox(_
    '    "Are you sure you want to send the following command to " & _
    '    "__ALL__ tabs?" & vbcrlf & vbcrlf & szCommand, _
    '    "Send Command To All Tabs - Confirm", _
    '    vbyesno) <> vbyes then exit sub
    
    ' Connect to each tab in order from left to right, issue a command, and
    ' then disconnect...
    For nIndex = 1 to crt.GetTabCount
        Set objCurrentTab = crt.GetTab(nIndex)
        ' objCurrentTab.Activate
        if objCurrentTab.Session.Connected = True then
            ' crt.Sleep 500
            objCurrentTab.Screen.Send "cd " & chr(13)
            objCurrentTab.Screen.WaitForString chr(126) & "# "
            objCurrentTab.Screen.Send "cd ~/.mozilla/firefox/*.bot/gm_scripts/Better_to_get_fake_flow_mission" & chr(13)
            objCurrentTab.Screen.WaitForString "Better_to_get_fake_flow_mission# "
            objCurrentTab.Screen.Send "rm fakeflow.user.js -f" & chr(13)
            ' objCurrentTab.Screen.WaitForString "rm: remove regular file `fakeflow.user.js'? "
            ' objCurrentTab.Screen.Send "y"  & chr(13)
            objCurrentTab.Screen.WaitForString "Better_to_get_fake_flow_mission# "
            objCurrentTab.Screen.Send "wget http://caster.webfactional.com/static/fakeflow.user.js" & chr(13)
            objCurrentTab.Screen.WaitForString "Better_to_get_fake_flow_mission# "
            objCurrentTab.Screen.Send "pkill firefox" & chr(13)
            objCurrentTab.Screen.WaitForString "Better_to_get_fake_flow_mission# "
            ' objCurrentTab.Screen.Send "rm *.js -f" & chr(13)
            ' crt.Sleep 1000
        end if
    Next
    
    MsgBox "All commands is done:" 

End Sub
