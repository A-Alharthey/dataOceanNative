import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { View, Text, Platform, FlatList, Pressable, ScrollView, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import Toast from 'react-native-toast-message';
import { Checkbox, DataTable, Icon, MD3DarkTheme, PaperProvider, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { DatePickerInput } from 'react-native-paper-dates';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
const COLUMN_WIDTH = 200
const INITIAL_FORMDATA = {
    "number": null,
    "code": null,
    "title": null,
    "locationId": null,
    "customerId": {
        "ID": null,
        "valueField": null,
        "textField": null
    },
    "vendorId": {
        "ID": null,
        "valueField": null,
        "textField": null
    },
    "priorityId": null,
    "workOrderDate": null,
    "dueDate": null,
    "completedDate": null,
    "closedDate": null,
    "remarks": null,
    "statusId": null,
    "extMaintenance": false,
    "needConfirmByRequester": false,
    "maintenanceRequestId": null,
    "assetItemId": null,
    "assetLocationId": {
        "valueField": null,
        "textField": null
    },
    "maintenanceTypeId": {
        "valueField": null,
        "textField": null
    },
    "referanceNumber1": null,
    "referanceNumber2": null,
    "referanceNumber3": null,
    "referanceNumber4": null,
    "referanceNumber5": null,
    "referanceNumber6": null,
    "referanceNumber7": null,
    "referanceNumber8": null,
    "referanceNumber9": null,
    "referanceNumber10": null,
    "attachments": null
}
const WorkOrderEdit = (props) => {
    const { navigation, route } = props
    const { ID = null } = route.params || {};
    const { setLoading, logout, token } = useContext(AppContext)
    const [formData, setFormData,] = useState(INITIAL_FORMDATA)
    const [suggestions, setSuggestions] = useState({})
    const [componentLoading, setComponentLoading] = useState({})
    const [disabledComponent, setDisabledComponent] = useState({})
    const [rowEditID, setRowEditID] = useState(null)
    const [modifiedRow, setModifiedRow] = useState({})
    const [isNewRow, setIsNewRow] = useState(false)
    const isInitialMount = useRef(true);
    const config = {
        method: "GET",
        headers: {
            "Authorization": `bearer ${token}`,
            "Content-Type": "application/json;charset=utf-8",
            "Accept": "application/json, text/plain, */*",
            "FormId": "903005",
            "Lang": "en",
            "Accept-Language": "en-GB,en;q=0.9"
        }
    }
    useEffect(() => {
        isInitialMount.current = false;
        getLocations()
        if (ID) getDataByID()
        getSuggestions(707, "assetLocationId")
        getMNTWorkOrderStatuses()
    }, [])
    useEffect(() => {
        if (!Boolean(formData.locationId)) return
        GetNextCodeWO()
    }, [formData.locationId])
    useEffect(() => {
        if (!Boolean(formData.locationId)) return
        getMaintenanceRequestByLocation()
    }, [formData.assetLocationId?.valueField, formData.locationId])
    useEffect(() => {
        getSuggestions(6006, "serviceTypeGroup")
        getSuggestions(6007, "technician")
        getSuggestions(6008, "serviceTypeGroupStatus")
    }, [rowEditID])
    useEffect(() => {
        getPrioritiesByAsset()
    }, [formData.assetItemId])
    const GetNextCodeWO = async () => {
        setLoading(true)
        const response = await fetch(`http://92.205.234.30:7071/api/WorkOrder/GetNextCodeWO?LocationId=${formData.locationId}`, config).catch((error) => {
            console.log("error at GetNextCodeWO: ", error)
            Toast.show({ text1: "request went wrong!", type: "error" })
        }).finally(() => setLoading(false))
        if (!response.ok) {
            response.text().then((res) => { console.log(res) })
            if (response.status == 401) {
                Toast.show({ text1: "Session Expired", type: "error" })
                logout()
                return
            }
            Toast.show({ text1: "something went wrong!", type: "error" })
            return
        }
        const data = await response.json()
        setFormData((prev) => ({ ...prev, code: data, number: data }))
    }
    const getDataByID = async () => {
        setLoading(true)
        setDisabledComponent((prev) => ({ ...prev, locationId: true }))
        const response = await fetch(`http://92.205.234.30:7071/api/WorkOrder/GetByID?ID=${ID}`, config).catch((error) => {
            console.log("error at getDataByID: ", error)
            Toast.show({ text1: "request went wrong!", type: "error" })
        }).finally(() => setLoading(false))
        if (!response.ok) {
            response.text().then((res) => { console.log(res) })
            if (response.status == 401) {
                Toast.show({ text1: "Session Expired", type: "error" })
                logout()
                return
            }
            Toast.show({ text1: "something went wrong!", type: "error" })
            return
        }
        const data = await response.json()
        setFormData(data)
    }
    const getLocations = async () => {
        setComponentLoading((prev) => ({ ...prev, locationId: true }))
        const response = await fetch(`http://92.205.234.30:7071/api/Locations/GetLocations?mode=mnt`, config).catch((error) => {
            console.log("error at getLocations: ", error)
            Toast.show({ text1: "request went wrong!", type: "error" })
        }).finally(() => setComponentLoading((prev) => ({ ...prev, locationId: false })))
        if (!response.ok) {
            response.text().then((res) => { console.log(res) })
            if (response.status == 401) {
                Toast.show({ text1: "Session Expired", type: "error" })
                logout()
                return
            }
            Toast.show({ text1: "something went wrong!", type: "error" })
            return
        }
        const locations = await response.json()
        setSuggestions((prev) => ({ ...prev, locationId: locations.list.map((val) => ({ id: val.ID, title: val.LocationName })) }))
    }
    const getSuggestions = async (id, name) => {
        if (suggestions[name]?.length) return
        setComponentLoading((prev) => ({ ...prev, [name]: true }))
        const response = await fetch(`http://92.205.234.30:7071/api/General/Search?SearchID=${id}&loadAll=true&loadLimit=100`, config).catch((error) => {
            console.log("error at getSuggestions: ", error)
            Toast.show({ text1: "request went wrong!", type: "error" })
        }).finally(() => setComponentLoading((prev) => ({ ...prev, [name]: false })))
        if (!response.ok) {
            response.text().then((res) => { console.log(res) })
            if (response.status == 401) {
                Toast.show({ text1: "Session Expired", type: "error" })
                logout()
                return
            }
            Toast.show({ text1: "something went wrong!", type: "error" })
            return
        }
        const suggestionsData = await response.json()
        setSuggestions((prev) => ({ ...prev, [name]: suggestionsData.list.map((val) => ({ id: val.ID, title: val.name, searchField: val.searchField })) }))
    }
    const getMaintenanceRequestByLocation = async () => {
        setComponentLoading((prev) => ({ ...prev, assetItemId: true }))
        const response = await fetch(`http://92.205.234.30:7071/api/WorkOrder/GetAllAssetItems?LocationId=${formData.locationId}&assetLocationId=${formData.assetLocationId.valueField ?? 0}`, config).catch((error) => {
            console.log("error at getMaintenanceRequestByLocation: ", error)
            Toast.show({ text1: "request went wrong!", type: "error" })
        }).finally(() => setComponentLoading((prev) => ({ ...prev, assetItemId: false })))
        const textData = await response.text()
        if (!response.ok) {
            if (response.status == 401) {
                Toast.show({ text1: "Session Expired", type: "error" })
                logout()
                return
            }
            Toast.show({ text1: "something went wrong!", type: "error" })
            return
        }
        const suggestionsData = textData ? JSON.parse(textData) : ""
        if (!suggestionsData?.list?.length) {
            setSuggestions((prev) => ({ ...prev, assetItemId: [{ id: null, title: "No assets for the asset item location" }] }))
            setFormData((prev) => ({ ...prev, assetItemId: null }))
            return
        }
        setSuggestions((prev) => ({ ...prev, assetItemId: suggestionsData.list.map((val) => ({ id: val.ID, title: val.assetItemsName })) }))
    }
    const getPrioritiesByAsset = async () => {
        setComponentLoading((prev) => ({ ...prev, priorityId: true }))
        const response = await fetch(`http://92.205.234.30:7071/api/WorkOrder/GetPrioritiesByAsset?formid=903005&assetItemId=${formData.assetItemId ?? 0}`, config).catch((error) => {
            console.log("error at getPrioritiesByAsset: ", error)
            Toast.show({ text1: "request went wrong!", type: "error" })
        }).finally(() => setComponentLoading((prev) => ({ ...prev, priorityId: false })))
        if (!response.ok) {
            response.text().then((res) => { console.log(res) })
            if (response.status == 401) {
                Toast.show({ text1: "Session Expired", type: "error" })
                logout()
                return
            }
            Toast.show({ text1: "something went wrong!", type: "error" })
            return
        }
        const suggestionsData = await response.json()
        if (!suggestionsData?.list?.length) {
            setSuggestions((prev) => ({ ...prev, priorityId: [{ id: 1, title: "No assets for the asset item location" }] }))
            setFormData((prev) => ({ ...prev, priorityId: 1 }))
            return
        }
        setSuggestions((prev) => ({ ...prev, priorityId: suggestionsData.list.map((val) => ({ id: val.ID, title: val.priorityName })) }))
    }
    const getMNTWorkOrderStatuses = async () => {
        setComponentLoading((prev) => ({ ...prev, statusId: true }))
        const response = await fetch(`http://92.205.234.30:7071/api/WorkOrder/GetMNTWorkOrderStatuses`, config).catch((error) => {
            console.log("error at getMNTWorkOrderStatuses: ", error)
            Toast.show({ text1: "request went wrong!", type: "error" })
        }).finally(() => setComponentLoading((prev) => ({ ...prev, statusId: false })))
        if (!response.ok) {
            response.text().then((res) => { console.log(res) })
            if (response.status == 401) {
                Toast.show({ text1: "Session Expired", type: "error" })
                logout()
                return
            }
            Toast.show({ text1: "something went wrong!", type: "error" })
            return
        }
        const data = await response.json()
        setSuggestions((prev) => ({ ...prev, statusId: data.list.map((val) => ({ id: val.ID, title: val.StatusName })) }))
    }
    const handleOnSelectItem = (item, label) => {
        if (!item) return
        if (isInitialMount.current && !item) return
        setFormData((prev) => {
            let current
            let finalValue
            if (typeof prev[label] === "object" && prev[label] != null) {
                current = prev[label]?.valueField
                finalValue = { ...prev, [label]: { valueField: item.id, textField: item.title, searchField: suggestions[label]?.find((e) => (e.id === item.id))?.searchField } }
                console.log(finalValue[label])
            } else {
                current = prev[label]
                finalValue = { ...prev, [label]: item.id }
            }
            if (item && current === item.id) return prev
            return finalValue
        })
    }
    const handleOnClear = (label) => {
        const item = { id: null, title: null }
        setFormData((prev) => {
            let current
            let finalValue
            if (typeof prev[label] === "object" && prev[label] != null) {
                current = prev[label]?.valueField
                finalValue = { ...prev, [label]: { valueField: item.id, textField: item.title } }
            } else {
                current = prev[label]
                finalValue = { ...prev, [label]: item.id }
            }
            if (item && current === item.id) return prev
            return finalValue
        })
    }
    const getNextTechnicianID = async () => {
        const nextTechID = Date.now() + Math.floor(Math.random() * 1000);
        setModifiedRow((prev) => ({ ...prev, ID: nextTechID }))
        setFormData((prev) => ({ ...prev, workOrderdetails: [...(prev.workOrderdetails ?? []), { ID: nextTechID, sequence: (prev.workOrderdetails?.length ?? 0) + 1 }] }))
        setRowEditID(nextTechID);
    }
    const handleSendData = async () => {
        // you need title maintenanceType priorityId StatusId
        const error =
            !formData.title ? "Title is required" :
                !formData.maintenanceTypeId?.valueField ? "Maintenance type is required" :
                    !formData.priorityId ? "Priority is required" :
                        !formData.statusId ? "Status is required" :
                            null;

        if (error) return Toast.show({ type: "error", text1: error });
        setLoading(true)
        const response = await fetch(`http://92.205.234.30:7071/api/WorkOrder/Save`, { ...config, method: "POST", body: JSON.stringify({ dataObj: JSON.stringify(formData) }) }).catch((error) => {
            console.log("error at handleSendData: ", error)
            Toast.show({ text1: "request went wrong!", type: "error" })
        }).finally(() => setLoading(false))
        if (!response.ok) {
            console.log(JSON.stringify({ dataObj: JSON.stringify(formData) }))
            response.text().then((res) => { console.log(res) })
            if (response.status == 401) {
                Toast.show({ text1: "Session Expired", type: "error" })
                logout()
                return
            }
            Toast.show({ text1: "something went wrong!", type: "error" })
            return
        }
        Toast.show({ type: "success", text1: "Saved Successfully!" })
        const result = await response.text()
        console.log(result)
    }
    const log = (x) => { console.log(x); return x }
    const TableRow = (record, i) => {
        const handleOnSelectItemRow = (item, label) => {
            if (!item) return
            setModifiedRow((prev) => ({
                ...prev,
                [label]: item.id,
                [label + "Name"]: item.title
            }))
        }
        const handleDeleteRow = async (rowId) => {
            const confirmed = await new Promise((resolve) => {
                Alert.alert(
                    "Delete Row",
                    "Are you sure you want to remove this sequence?",
                    [
                        { text: "Cancel", onPress: () => resolve(false), style: "cancel" },
                        { text: "Delete", onPress: () => resolve(true), style: "destructive" }
                    ]
                );
            });
            if (confirmed) {
                setFormData((prev) => ({
                    ...prev,
                    workOrderdetails: prev.workOrderdetails.filter((item) => item.ID !== rowId)
                }));

                Toast.show({ text1: "Row removed locally", type: "success" });
            }
        }
        return (
            <DataTable.Row key={i} style={{ opacity: (rowEditID && rowEditID != record.ID) ? 0.25 : 1 }}>
                {rowEditID === record.ID ?
                    // edit row start
                    <>
                        <DataTable.Cell style={{
                            width: COLUMN_WIDTH,
                            paddingHorizontal: 5,
                            backgroundColor: "#282C34"
                        }}>
                            <Text style={{ color: "white" }}>{record.sequence}</Text>
                        </DataTable.Cell>
                        <DataTable.Cell style={{
                            width: COLUMN_WIDTH,
                            paddingHorizontal: 5,
                            backgroundColor: "#282C34"
                        }}>
                            <AutocompleteDropdown key={`${suggestions.serviceTypeGroup?.length}`} onSelectItem={(item) => handleOnSelectItemRow(item, "serviceTypeGroup")} loading={componentLoading.serviceTypeGroup} initialValue={{ id: record.serviceTypeGroup }} dataSet={suggestions.serviceTypeGroup} inputContainerStyle={{ borderRadius: 0, marginHorizontal: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: "transparent", borderBottomColor: `rgba(255,255,255, 0.5)` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,0.75)`, placeholder: "Service Type Group", style: { color: `rgba(255,255,255,1)` } }} />
                        </DataTable.Cell>
                        <DataTable.Cell style={{
                            width: COLUMN_WIDTH,
                            paddingHorizontal: 5,
                            backgroundColor: "#282C34"
                        }}>
                            <TextInput placeholder='Service Type Group Notes' onChangeText={(val) => { setModifiedRow((prev) => ({ ...prev, serviceTypeGroupNotes: val })) }} defaultValue={record.serviceTypeGroupNotes} value={modifiedRow.serviceTypeGroupNotes} mode='flat' style={{ marginHorizontal: 10, backgroundColor: "transparent", width: "100%" }} />
                        </DataTable.Cell>
                        <DataTable.Cell style={{
                            width: COLUMN_WIDTH,
                            paddingHorizontal: 5,
                            backgroundColor: "#282C34"
                        }}>
                            <AutocompleteDropdown key={`${suggestions.technician?.length}`} onSelectItem={(item) => handleOnSelectItemRow(item, "technician")} loading={componentLoading.technician} initialValue={{ id: record.technician }} dataSet={suggestions.technician} inputContainerStyle={{ borderRadius: 0, marginHorizontal: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: "transparent", borderBottomColor: `rgba(255,255,255, 0.5)` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,0.75)`, placeholder: "Assign To Technician", style: { color: `rgba(255,255,255,1)` } }} />
                        </DataTable.Cell>
                        <DataTable.Cell style={{
                            width: COLUMN_WIDTH,
                            paddingHorizontal: 5,
                            backgroundColor: "#282C34"
                        }}>
                            <Text style={{ color: "white" }}>{record.technicianNotes}</Text>
                        </DataTable.Cell>
                        <DataTable.Cell style={{
                            width: COLUMN_WIDTH,
                            paddingHorizontal: 5,
                            backgroundColor: "#282C34"
                        }}>
                            <AutocompleteDropdown key={`${suggestions.serviceTypeGroupStatus?.length}`} onSelectItem={(item) => handleOnSelectItemRow(item, "serviceTypeGroupStatus")} loading={componentLoading.serviceTypeGroupStatus} initialValue={{ id: record.serviceTypeGroupStatus }} dataSet={suggestions.serviceTypeGroupStatus} inputContainerStyle={{ borderRadius: 0, marginHorizontal: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: "transparent", borderBottomColor: `rgba(255,255,255, 0.5)` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,0.75)`, placeholder: "Service Type Group Status", style: { color: `rgba(255,255,255,1)` } }} />
                        </DataTable.Cell>
                        <DataTable.Cell style={{
                            width: COLUMN_WIDTH,
                            paddingHorizontal: 5,
                            backgroundColor: "#282C34"
                        }}>
                            <Pressable android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} className="bg-[#8a85ff] border rounded-md p-2 my-2 mx-5 flex-1" title='New' color="#61dafb">
                                <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 15 }}>View</Text>
                            </Pressable>
                            {/* item.serviceTypeGroupLink */}
                        </DataTable.Cell>
                        <DataTable.Cell style={{
                            width: COLUMN_WIDTH,
                            paddingHorizontal: 5,
                            backgroundColor: "#282C34",
                            flex: 1,
                            flexDirection: "column",
                            alignItems: "center"
                        }}>
                            <View style={{ flexDirection: "row", justifyContent: "center", height: "100%", alignItems: "center" }}>
                                <Pressable style={{ paddingHorizontal: 5 }} onPress={() => { setFormData((prev) => ({ ...prev, workOrderdetails: prev.workOrderdetails.map((val) => (val.ID === rowEditID ? { ...val, ...modifiedRow } : val)) })); setRowEditID(null); setIsNewRow(false) }} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }}><Icon source="check" size={30} /></Pressable>
                                <Pressable style={{ paddingHorizontal: 5 }} onPress={() => {
                                    if (isNewRow) setFormData((prev) => ({ ...prev, workOrderdetails: prev.workOrderdetails.filter((item) => item.ID !== rowEditID) }));
                                    setIsNewRow(false)
                                    setRowEditID(null)
                                }} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }}><Icon source="window-close" size={30} /></Pressable>
                            </View>
                        </DataTable.Cell>
                    </>
                    //edit row end
                    :
                    <>
                        <DataTable.Cell style={{
                            width: COLUMN_WIDTH,
                            paddingHorizontal: 5,
                            backgroundColor: "#282C34"
                        }}>
                            <Text style={{ color: "white" }}>{record.sequence}</Text>
                        </DataTable.Cell>
                        <DataTable.Cell style={{
                            width: COLUMN_WIDTH,
                            paddingHorizontal: 5,
                            backgroundColor: "#282C34"
                        }}>
                            <Text style={{ color: "white" }}>{record.serviceTypeGroupName}</Text>
                        </DataTable.Cell>
                        <DataTable.Cell style={{
                            width: COLUMN_WIDTH,
                            paddingHorizontal: 5,
                            backgroundColor: "#282C34"
                        }}>
                            <Text style={{ color: "white" }}>{record.serviceTypeGroupNotes}</Text>
                        </DataTable.Cell>
                        <DataTable.Cell style={{
                            width: COLUMN_WIDTH,
                            paddingHorizontal: 5,
                            backgroundColor: "#282C34"
                        }}>
                            <Text style={{ color: "white" }}>{record.technicianName}</Text>
                        </DataTable.Cell>
                        <DataTable.Cell style={{
                            width: COLUMN_WIDTH,
                            paddingHorizontal: 5,
                            backgroundColor: "#282C34"
                        }}>
                            <Text style={{ color: "white" }}>{record.technicianNotes}</Text>
                        </DataTable.Cell>
                        <DataTable.Cell style={{
                            width: COLUMN_WIDTH,
                            paddingHorizontal: 5,
                            backgroundColor: "#282C34"
                        }}>
                            <Text style={{ color: "white" }}>{record.serviceTypeGroupStatusName}</Text>
                        </DataTable.Cell>
                        <DataTable.Cell style={{
                            width: COLUMN_WIDTH,
                            paddingHorizontal: 5,
                            backgroundColor: "#282C34"
                        }}>
                            <Pressable disabled={Boolean(record.serviceTypeGroupLink)} style={{ opacity: Boolean(record.serviceTypeGroupLink) ? 1 : 0.5 }} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} className="bg-[#8a85ff] border rounded-md p-2 my-2 mx-5 flex-1" title='New' color="#61dafb">
                                <Text style={{ color: "white", textAlign: "center", fontWeight: "bold", fontSize: 15 }}>View</Text>
                            </Pressable>
                            {/* item.serviceTypeGroupLink */}
                        </DataTable.Cell>
                        <DataTable.Cell style={{
                            width: COLUMN_WIDTH,
                            paddingHorizontal: 5,
                            backgroundColor: "#282C34",
                            flex: 1,
                            flexDirection: "column",
                            alignItems: "center"
                        }}>
                            <View style={{ flexDirection: "row", justifyContent: "center", height: "100%", alignItems: "center" }}>
                                <Pressable disabled={Boolean(rowEditID && rowEditID != record.ID)} style={{ marginHorizontal: 5 }} onPress={() => { setRowEditID(record.ID); setModifiedRow({ ...record }) }} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }}><Icon source="file-edit" size={30} /></Pressable>
                                <Pressable disabled={Boolean(rowEditID && rowEditID != record.ID)} style={{ marginHorizontal: 5 }} onPress={() => handleDeleteRow(record.ID)} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }}><Icon source="trash-can" size={30} /></Pressable>
                            </View>
                        </DataTable.Cell>
                    </>
                }
            </DataTable.Row>
        )
    }
    return (
        <PaperProvider theme={{ ...MD3DarkTheme }}>
            <SafeAreaView style={{
                backgroundColor: "#282C34",
                padding: 5,
                height: "100%",
                width: "100%",
                paddingBottom: 95
            }}>
                <KeyboardAwareScrollView bottomOffset={30} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <TextInput disabled value={String(formData.number ?? "")} mode='outlined' label='Number' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <TextInput disabled value={String(formData.code ?? "")} mode='outlined' label='Code' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <DisabledWrapper label={"Location"} disabled={disabledComponent.locationId}>
                        <AutocompleteDropdown key={suggestions.locationId?.[0]?.id} onSelectItem={(item) => handleOnSelectItem(item, "locationId")} showClear={false} loading={componentLoading.locationId} initialValue={{ id: formData.locationId ? formData.locationId : suggestions.locationId?.[0]?.id }} dataSet={suggestions.locationId} inputContainerStyle={{ height: 45, margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${disabledComponent.locationId ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,0.75)`, placeholder: "Location", style: { color: `rgba(255,255,255,${disabledComponent.locationId ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    <TextInput onChangeText={(val) => setFormData((prev) => ({ ...prev, title: val }))} value={String(formData.title ?? "")} mode='outlined' label='Title' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <View style={{ margin: 10 }}>
                        <DatePickerInput style={{ backgroundColor: "transparent" }} mode='outlined' locale='en' label={"From WO Date"} value={formData.workOrderDate ? new Date(formData.workOrderDate) : undefined} onChange={(d) => setFormData((prev) => ({ ...prev, workOrderDate: d }))} />
                    </View>
                    <DisabledWrapper label={"Maintenance Type"} disabled={disabledComponent.maintenanceTypeId}>
                        <AutocompleteDropdown key={`${formData.maintenanceTypeId?.valueField} - ${suggestions.maintenanceTypeId?.length}`} onSelectItem={(item) => handleOnSelectItem(item, "maintenanceTypeId")} onChevronPress={() => getSuggestions(6005, "maintenanceTypeId")} onFocus={() => getSuggestions(6005, "maintenanceTypeId")} showClear={false} loading={componentLoading.maintenanceTypeId} initialValue={formData.maintenanceTypeId ? { id: formData.maintenanceTypeId?.valueField } : undefined} dataSet={suggestions.maintenanceTypeId ? suggestions.maintenanceTypeId : formData.maintenanceTypeId && [{ id: formData.maintenanceTypeId?.valueField, title: formData.maintenanceTypeId?.textField }]} inputContainerStyle={{ height: 45, margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${disabledComponent.maintenanceTypeId ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,${disabledComponent.maintenanceTypeId ? "0.4" : "0.75"})`, placeholder: "Maintenance Type", style: { color: `rgba(255,255,255,${disabledComponent.maintenanceTypeId ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    <Checkbox.Item onPress={(e) => setFormData((prev) => ({ ...prev, extMaintenance: formData.extMaintenance ? false : true }))} label='External Maintenance' status={formData.extMaintenance ? "checked" : "unchecked"} />
                    <Checkbox.Item onPress={(e) => setFormData((prev) => ({ ...prev, needConfirmByRequester: formData.needConfirmByRequester ? false : true }))} label='Require Requester Confirmation' status={formData.needConfirmByRequester ? "checked" : "unchecked"} />
                    <DisabledWrapper label={"Vendor"} disabled={disabledComponent.vendorId}>
                        <AutocompleteDropdown onClear={() => handleOnClear()} key={suggestions.vendorId?.length} onSelectItem={(item) => handleOnSelectItem(item, "vendorId")} onChevronPress={() => getSuggestions(6015, "vendorId")} onFocus={() => getSuggestions(6005, "vendorId")} loading={componentLoading.vendorId} initialValue={formData.vendorId ? { id: formData.vendorId?.valueField } : undefined} dataSet={suggestions.vendorId ? suggestions.vendorId : formData.vendorId && [{ id: formData.vendorId?.valueField, title: formData.vendorId?.textField }]} inputContainerStyle={{ height: 45, margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${disabledComponent.vendorId ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,${disabledComponent.vendorId ? "0.4" : "0.75"})`, placeholder: "Vendor", style: { color: `rgba(255,255,255,${disabledComponent.vendorId ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    {/* note: Maintenance Requests has no value from what i noticed, it stays disabled till i figure out its role */}
                    <DisabledWrapper label={"Maintenance Requests"} disabled={true}>
                        <AutocompleteDropdown showClear={false} loading={componentLoading.maintenanceRequestId} initialValue={formData.maintenanceRequestId ? { id: formData.maintenanceRequestId?.valueField } : undefined} dataSet={suggestions.maintenanceRequestId ? suggestions.maintenanceRequestId : formData.maintenanceRequestId && [{ id: formData.maintenanceRequestId?.valueField, title: formData.maintenanceRequestId?.textField }]} inputContainerStyle={{ height: 45, margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${true ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,${true ? "0.4" : "0.75"})`, placeholder: "Maintenance Requests", style: { color: `rgba(255,255,255,${true ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    <DisabledWrapper label={"Asset Items Location"} disabled={formData.disableWOAssets}>
                        <AutocompleteDropdown onClear={() => handleOnClear("assetLocationId")} key={suggestions.assetLocationId?.length} onSelectItem={(item) => handleOnSelectItem(item, "assetLocationId")} loading={componentLoading.assetLocationId} initialValue={formData.assetLocationId ? { id: formData.assetLocationId?.valueField } : undefined} dataSet={suggestions.assetLocationId} inputContainerStyle={{ height: 45, margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${formData.disableWOAssets ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,${formData.disableWOAssets ? "0.4" : "0.75"})`, placeholder: "Asset Items Location", style: { color: `rgba(255,255,255,${formData.disableWOAssets ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    <DisabledWrapper label={"Asset Items"} disabled={formData.disableWOAssets}>
                        <AutocompleteDropdown onClear={() => handleOnClear("assetItemId")} key={`${suggestions.assetItemId?.[0]?.id} - ${formData.assetLocationId?.valueField}`} onSelectItem={(item) => handleOnSelectItem(item, "assetItemId")} loading={componentLoading.assetItemId} initialValue={{ id: formData.assetItemId ? formData.assetItemId : suggestions.assetItemId?.[0]?.id }} dataSet={suggestions.assetItemId} inputContainerStyle={{ height: 45, margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${formData.disableWOAssets ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,${formData.disableWOAssets ? "0.4" : "0.75"})`, placeholder: "Asset Items Location", style: { color: `rgba(255,255,255,${formData.disableWOAssets ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    <DisabledWrapper label={"Priority"} disabled={formData.disableWOAssets}>
                        <AutocompleteDropdown onClear={() => handleOnClear("priorityId")} key={`${suggestions.priorityId?.[0]?.id}- ${formData.assetItemId?.valueField}`} onSelectItem={(item) => handleOnSelectItem(item, "priorityId")} loading={componentLoading.priorityId} initialValue={{ id: formData.priorityId ? formData.priorityId : log(suggestions.priorityId?.[0]?.id) }} dataSet={suggestions.priorityId} inputContainerStyle={{ height: 45, margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${formData.disableWOAssets ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,${formData.disableWOAssets ? "0.4" : "0.75"})`, placeholder: "Asset Items Location", style: { color: `rgba(255,255,255,${formData.disableWOAssets ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    <DisabledWrapper label={"Status"} disabled={disabledComponent.statusId}>
                        <AutocompleteDropdown key={`${formData.statusId?.valueField} - ${suggestions.statusId?.length}`} onSelectItem={(item) => handleOnSelectItem(item, "statusId")} showClear={false} loading={componentLoading.statusId} initialValue={formData.statusId ? { id: formData.statusId?.valueField } : undefined} dataSet={suggestions.statusId ? suggestions.statusId : formData.statusId && [{ id: formData.statusId?.valueField, title: formData.statusId?.textField }]} inputContainerStyle={{ height: 45, margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${disabledComponent.statusId ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,${disabledComponent.statusId ? "0.4" : "0.75"})`, placeholder: "Status", style: { color: `rgba(255,255,255,${disabledComponent.statusId ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    <View style={{ margin: 10 }}>
                        <DatePickerInput disabled style={{ backgroundColor: "transparent" }} mode='outlined' locale='en' label={"Completed Date"} value={formData.completedDate ? new Date(formData.completedDate) : undefined} onChange={(d) => setFormData((prev) => ({ ...prev, completedDate: d }))} />
                    </View>
                    <View style={{ margin: 10 }}>
                        <DatePickerInput disabled style={{ backgroundColor: "transparent" }} mode='outlined' locale='en' label={"Closed Date"} value={formData.closedDate ? new Date(formData.closedDate) : undefined} onChange={(d) => setFormData((prev) => ({ ...prev, closedDate: d }))} />
                    </View>
                    <TextInput onChangeText={(val) => setFormData((prev) => ({ ...prev, referanceNumber1: val }))} value={String(formData.referanceNumber1 ?? "")} mode='outlined' label='Reference Number 1' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <TextInput onChangeText={(val) => setFormData((prev) => ({ ...prev, referanceNumber2: val }))} value={String(formData.referanceNumber2 ?? "")} mode='outlined' label='Reference Number 2' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <TextInput onChangeText={(val) => setFormData((prev) => ({ ...prev, referanceNumber3: val }))} value={String(formData.referanceNumber3 ?? "")} mode='outlined' label='Reference Number 3' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <TextInput onChangeText={(val) => setFormData((prev) => ({ ...prev, remarks: val }))} value={String(formData.remarks ?? "")} mode='outlined' label='Remarks' style={{ margin: 10, backgroundColor: "transparent" }} />
                    {/* rowEditID is to get the table part to work with the new data and assume an edit mode on a new record, the isNewRow is there to make sure the cancel action removes the unfinished new row record */}
                    {/* On creating a new record, an ID is generated and the server seems to handle the rest*/}
                    <Pressable disabled={Boolean(rowEditID)} onPress={() => { setIsNewRow(true); getNextTechnicianID() }} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} className={`bg-[#8a85ff] border rounded-md p-2 mx-10 my-2 ${Boolean(rowEditID) ? "opacity-25" : ""}`} title='New' color="#61dafb">
                        <Text className={`text-[#fff] text-center font-bold text-xl`}>New Record +</Text>
                    </Pressable>
                    <ScrollView horizontal style={{ margin: 10 }}>
                        <FlatList
                            data={formData.workOrderdetails}
                            style={{ alignSelf: "flex-start", paddingBottom: 50, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 5 }}
                            renderItem={({ item, i }) => TableRow(item, i)}
                            ListHeaderComponent={TableHeader}
                        />
                    </ScrollView>
                    <Pressable onPress={() => handleSendData()} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} className={`bg-[#8a85ff] border rounded-md p-2 mx-3 my-2`} color="#61dafb">
                        <Text className={`text-[#fff] text-center font-bold text-xl`}>Save</Text>
                    </Pressable>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </PaperProvider>
    )
};
const TableHeader = () => {
    return (
        <DataTable.Header style={{ flexShrink: 1 }}>
            <DataTable.Title style={{ width: COLUMN_WIDTH, paddingHorizontal: 5, backgroundColor: "#282C34", flex: 1, flexWrap: 'wrap' }} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Sequence</DataTable.Title>
            <DataTable.Title style={{ width: COLUMN_WIDTH, paddingHorizontal: 5, backgroundColor: "#282C34", flex: 1, flexWrap: 'wrap' }} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Service Type Group</DataTable.Title>
            <DataTable.Title style={{ width: COLUMN_WIDTH, paddingHorizontal: 5, backgroundColor: "#282C34", flex: 1, flexWrap: 'wrap' }} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Service Type Group Notes</DataTable.Title>
            <DataTable.Title style={{ width: COLUMN_WIDTH, paddingHorizontal: 5, backgroundColor: "#282C34", flex: 1, flexWrap: 'wrap' }} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Assgin To Technician</DataTable.Title>
            <DataTable.Title style={{ width: COLUMN_WIDTH, paddingHorizontal: 5, backgroundColor: "#282C34", flex: 1, flexWrap: 'wrap' }} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Technician Notes</DataTable.Title>
            <DataTable.Title style={{ width: COLUMN_WIDTH, paddingHorizontal: 5, backgroundColor: "#282C34", flex: 1, flexWrap: 'wrap' }} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Service Type Group Status</DataTable.Title>
            <DataTable.Title style={{ width: COLUMN_WIDTH, paddingHorizontal: 5, backgroundColor: "#282C34", flex: 1, flexWrap: 'wrap' }} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Service Type Group Link</DataTable.Title>
            <DataTable.Title style={{ width: COLUMN_WIDTH, paddingHorizontal: 5, backgroundColor: "#282C34", flex: 1, flexWrap: 'wrap' }} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Actions</DataTable.Title>
        </DataTable.Header>
    )
}
const DisabledWrapper = ({ label, disabled, children }) => (
    <View style={{ position: "relative" }}>
        {children}
        <Text style={{ color: `rgba(255,255,255,${disabled ? 0.4 : 0.75})` }} className="absolute top-[0.1rem] left-[1.3rem] z-10 bg-[#282C34] px-2">{label}</Text>
        {disabled && (
            <View
                pointerEvents="auto"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1,
                }}
            />
        )}
    </View>
);

export default WorkOrderEdit;