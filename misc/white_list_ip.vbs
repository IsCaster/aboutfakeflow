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
    szIp = crt.Dialog.Prompt("Enter IP to be added in the whitelist", _
                                  "White List IP", "", False)
    if szIp = "" then exit sub
    
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
            'objCurrentTab.Screen.Send "ufw reset" & chr(13)
            'objCurrentTab.Screen.WaitForString "Proceed with operation (y|n)? "
            'objCurrentTab.Screen.Send "y"  & chr(13)
            'objCurrentTab.Screen.WaitForString chr(126) & "# "
            objCurrentTab.Screen.Send "ufw allow 22/tcp" & chr(13)
            objCurrentTab.Screen.WaitForString chr(126) & "# "
            objCurrentTab.Screen.Send "ufw allow 22000/tcp"  & chr(13)
            objCurrentTab.Screen.WaitForString chr(126) & "# "
            objCurrentTab.Screen.Send "ufw allow 53"  & chr(13)
            objCurrentTab.Screen.WaitForString chr(126) & "# "
            objCurrentTab.Screen.Send "ufw allow proto tcp from " &szIp & " to any port 5901"  & chr(13)
            objCurrentTab.Screen.WaitForString chr(126) & "# "
            objCurrentTab.Screen.Send "ufw default reject incoming "  & chr(13)
            objCurrentTab.Screen.WaitForString chr(126) & "# "
            objCurrentTab.Screen.Send "ufw allow from " &szIp  & chr(13)
            objCurrentTab.Screen.WaitForString chr(126) & "# "
            objCurrentTab.Screen.Send "ufw enable "  & chr(13)
            objCurrentTab.Screen.WaitForString "Proceed with operation (y|n)? "
            objCurrentTab.Screen.Send "y"  & chr(13)
            objCurrentTab.Screen.WaitForString chr(126) & "# "
            ' objCurrentTab.Screen.Send "rm *.js -f" & chr(13)
            ' crt.Sleep 1000
        end if
    Next
    
    MsgBox "All commands is done:" 

End Sub
