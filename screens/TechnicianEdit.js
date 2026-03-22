import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { View, Text, Platform, FlatList, Pressable, ScrollView, Alert, Image, ImageBackground } from 'react-native';
import { AppContext } from '../context/AppContext';
import Toast from 'react-native-toast-message';
import { Checkbox, DataTable, Icon, MD3DarkTheme, PaperProvider, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { DatePickerInput } from 'react-native-paper-dates';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as ImagePicker from 'expo-image-picker';
const COLUMN_WIDTH = 200
const INITIAL_FORMDATA = {
    "ID": null,
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
    "priorityId": {
        "valueField": null,
        "textField": null
    },
    "workOrderDate": null,
    "dueDate": null,
    "remarks": "",
    "extMaintenance": false,
    "needConfirmByRequester": false,
    "maintenanceRequestId": {
        "valueField": null,
        "textField": null
    },
    "assetItemId": {
        "valueField": null,
        "textField": null
    },
    "referanceNumber1": "",
    "referanceNumber2": "",
    "referanceNumber3": "",
    "referanceNumber4": "",
    "referanceNumber5": "",
    "referanceNumber6": "",
    "referanceNumber7": "",
    "referanceNumber8": "",
    "referanceNumber9": "",
    "referanceNumber10": "",
    "serviceGroupCompletedDate": null,
    "serviceTypeGroupNotes": null,
    "statusId": null,
    "serviceTypeGroupSequence": null,
    "serviceTypeGroupId": {
        "valueField": null,
        "textField": null
    },
    "technicianId": {
        "valueField": null,
        "textField": null
    },
    "imageBefore": null,
    "imageAfter": null,
    "technicianNotes": null,
    "lastActionType": null,
    "isPaused": null,
    "canAcceptServiceTypeGroup": null,
    "acceptedDate": null,
    "canRejectedServiceTypeGroup": null,
    "showCheckList": null,
    "rejectedReason": null,
    "rejectedDate": null,
    "technicianServicesDetails": null,
    "serviceTypeGroupChecklists": null,
    "attachments": null
}
export default function TechnicianEdit(props) {
    const [formData, setFormData] = useState(INITIAL_FORMDATA)
    const { setLoading, logout, token } = useContext(AppContext)
    const { navigation, route } = props
    const { ID = null } = route.params || {};
    const [componentLoading, setComponentLoading] = useState({})
    const [suggestions, setSuggetions] = useState({})
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
        getByID()
        getLocations()
        getStatuses()
    }, [])
    const getByID = async () => {
        setLoading(true)
        const response = await fetch(`http://92.205.234.30:7071/api/TechnicianServices/GetByID?ID=${ID}`, config).catch((error) => {
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
        setLoading(true)
        const response = await fetch(`http://92.205.234.30:7071/api/Locations/GetLocations?mode=mnt`, config).catch((error) => {
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
        const suggestionsData = await response.json()
        setSuggetions((prev) => ({ ...prev, locationId: suggestionsData.list.map((e) => ({ id: e.ID, title: e.LocationName })) }))
    }
    const getStatuses = async () => {
        setLoading(true)
        const response = await fetch(`http://92.205.234.30:7071/api/TechnicianServices/GetMNTServiceTypeGroupStatuses`, config).catch((error) => {
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
        const suggestionsData = await response.json()
        setSuggetions((prev) => ({ ...prev, statusId: suggestionsData.list.map((e) => ({ id: e.ID, title: e.StatusName })) }))
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

                    <TextInput disabled value={String(formData.serviceTypeGroupSequence ?? "")} mode='outlined' label='Sequence' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <TextInput disabled value={String(formData.number ?? "")} mode='outlined' label='Number' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <TextInput disabled value={String(formData.code ?? "")} mode='outlined' label='WO Code' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <TextInput disabled value={String(formData.title ?? "")} mode='outlined' label='WO Title' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <DisabledWrapper label={"Location"} disabled={true}>
                        <AutocompleteDropdown key={suggestions.locationId?.[0]?.id} showClear={false} loading={componentLoading.locationId} initialValue={{ id: formData.locationId ? formData.locationId : suggestions.locationId?.[0]?.id }} dataSet={suggestions.locationId} inputContainerStyle={{ height: 45, margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${true ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,${true ? "0.4" : "0.75"})`, placeholder: "Location", style: { color: `rgba(255,255,255,${true ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    <View style={{ margin: 10 }}>
                        <DatePickerInput disabled style={{ backgroundColor: "transparent" }} mode='outlined' locale='en' label={"Work Order Date"} value={formData.workOrderDate ? new Date(formData.workOrderDate) : undefined} onChange={(d) => setFormData((prev) => ({ ...prev, workOrderDate: d }))} />
                    </View>
                    <View style={{ margin: 10 }}>
                        <DatePickerInput disabled style={{ backgroundColor: "transparent" }} mode='outlined' locale='en' label={"WO Due Date"} value={formData.dueDate ? new Date(formData.dueDate) : undefined} onChange={(d) => setFormData((prev) => ({ ...prev, dueDate: d }))} />
                    </View>
                    <Checkbox.Item disabled onPress={(e) => setFormData((prev) => ({ ...prev, extMaintenance: formData.needConfirmByRequester ? false : true }))} label='Need Confirm By Requester' status={formData.needConfirmByRequester ? "checked" : "unchecked"} />
                    {/* note: Maintenance Requests has no value from what i noticed, it stays disabled till i figure out its role */}
                    <DisabledWrapper label={"Maintenance Requests"} disabled={true}>
                        <AutocompleteDropdown showClear={false} loading={componentLoading.maintenanceRequestId} initialValue={formData.maintenanceRequestId ? { id: formData.maintenanceRequestId?.valueField } : undefined} dataSet={suggestions.maintenanceRequestId ? suggestions.maintenanceRequestId : formData.maintenanceRequestId && [{ id: formData.maintenanceRequestId?.valueField, title: formData.maintenanceRequestId?.textField }]} inputContainerStyle={{ height: 45, margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${true ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,${true ? "0.4" : "0.75"})`, placeholder: "Maintenance Requests", style: { color: `rgba(255,255,255,${true ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    <DisabledWrapper label={"Asset Items"} disabled={true}>
                        <AutocompleteDropdown key={formData.assetItemId.valueField} showClear={false} initialValue={{ id: formData.assetItemId.valueField }} dataSet={[{ id: formData.assetItemId.valueField, title: formData.assetItemId.textField }]} inputContainerStyle={{ height: 45, margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${true ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,${true ? "0.4" : "0.75"})`, placeholder: "Asset Items", style: { color: `rgba(255,255,255,${true ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    <DisabledWrapper label={"Service Type Group"} disabled={true}>
                        <AutocompleteDropdown key={formData.serviceTypeGroupId.valueField} showClear={false} initialValue={{ id: formData.serviceTypeGroupId.valueField }} dataSet={[{ id: formData.serviceTypeGroupId.valueField, title: formData.serviceTypeGroupId.textField }]} inputContainerStyle={{ height: 45, margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${true ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,${true ? "0.4" : "0.75"})`, placeholder: "Service Type Group", style: { color: `rgba(255,255,255,${true ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    <DisabledWrapper label={"Assign To Technician"} disabled={true}>
                        <AutocompleteDropdown key={formData.technicianId.valueField} showClear={false} initialValue={{ id: formData.technicianId.valueField }} dataSet={[{ id: formData.technicianId.valueField, title: formData.technicianId.textField }]} inputContainerStyle={{ height: 45, margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${true ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,${true ? "0.4" : "0.75"})`, placeholder: "Assign To Technician", style: { color: `rgba(255,255,255,${true ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    <DisabledWrapper label={"Priority"} disabled={true}>
                        <AutocompleteDropdown key={formData.priorityId.valueField} showClear={false} initialValue={{ id: formData.priorityId.valueField }} dataSet={[{ id: formData.priorityId.valueField, title: formData.priorityId.textField }]} inputContainerStyle={{ height: 45, margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${true ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,${true ? "0.4" : "0.75"})`, placeholder: "Priority", style: { color: `rgba(255,255,255,${true ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    <TextInput disabled value={String(formData.remarks ?? "")} mode='outlined' label='WO Remarks' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <TextInput disabled value={String(formData.serviceTypeGroupNotes ?? "")} mode='outlined' label='Service Type Group Notes' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <TextInput disabled value={String(formData.technicianNotes ?? "")} mode='outlined' label='Technician Notes' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <DisabledWrapper label={"Status"} disabled={true}>
                        <AutocompleteDropdown key={`${formData.statusId} - ${suggestions.statusId?.[0].id}`} showClear={false} initialValue={formData.statusId ? { id: formData.statusId } : undefined} dataSet={suggestions.statusId} inputContainerStyle={{ height: 45, margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${true ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,${true ? "0.4" : "0.75"})`, placeholder: "Status", style: { color: `rgba(255,255,255,${true ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    <View style={{ margin: 10 }}>
                        <DatePickerInput disabled style={{ backgroundColor: "transparent" }} mode='outlined' locale='en' label={"Service Group Complete Date"} value={formData.serviceGroupCompletedDate ? new Date(formData.serviceGroupCompletedDate) : undefined} onChange={(d) => setFormData((prev) => ({ ...prev, serviceGroupCompletedDate: d }))} />
                    </View>
                    <View style={{ margin: 10 }}>
                        <DatePickerInput disabled style={{ backgroundColor: "transparent" }} mode='outlined' locale='en' label={"Rejected Date"} value={formData.rejectedDate ? new Date(formData.rejectedDate) : undefined} onChange={(d) => setFormData((prev) => ({ ...prev, rejectedDate: d }))} />
                    </View>
                    <View style={{ margin: 10 }}>
                        <DatePickerInput disabled style={{ backgroundColor: "transparent" }} mode='outlined' locale='en' label={"Accepted Date"} value={formData.acceptedDate ? new Date(formData.acceptedDate) : undefined} onChange={(d) => setFormData((prev) => ({ ...prev, acceptedDate: d }))} />
                    </View>
                    <Text style={{ marginLeft: 30, marginBottom: 10, color: "rgba(255,255,255,0.75)" }}>Image Before</Text>
                    <View style={{
                        marginHorizontal: 30,
                        borderWidth: 2,
                        borderRadius: 5,
                        borderColor: "rgba(255,255,255,0.5)",
                        marginBottom: 15
                    }}>
                        <ImageBackground
                            source={formData.imageBefore ? { uri: formData.imageBefore } : null}
                            resizeMode='cover'
                            imageStyle={{ width: '100%', height: '100%', objectFit: "cover" }}
                            style={{
                                flex: 1,
                                width: "100%",
                                minHeight: 120,
                                maxHeight: 300
                            }}
                        >
                            <View style={{ flex: 1, flexDirection: "row", borderWidth: 2, alignItems: "flex-end", justifyContent: "space-around" }}>
                                <Pressable style={{ paddingHorizontal: 20 }} onPress={async () => {
                                    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                                    if (!permissionResult) {
                                        Alert.alert('Permission required', 'Permission to access the media library is required.');
                                        return
                                    }
                                    let result = await ImagePicker.launchImageLibraryAsync({
                                        mediaTypes: ['images'],
                                        allowsEditing: true,
                                        quality: 1,
                                        base64: true,
                                    });
                                    if (!result.assets) return
                                    setFormData((prev) => ({ ...prev, imageBefore: result.assets[0].uri }))
                                }} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.30)" }}>
                                    <Icon size={40} source={"image-area"} />
                                </Pressable>
                                <Pressable onPress={() => setFormData((prev) => ({ ...prev, imageBefore: null }))} style={{ display: formData.imageBefore ? "" : "none", paddingHorizontal: 20 }} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.30)" }}>
                                    <Icon size={40} source={"trash-can"} />
                                </Pressable>
                            </View>
                        </ImageBackground>
                    </View>
                    <Text style={{ marginLeft: 30, marginBottom: 10, color: "rgba(255,255,255,0.75)" }}>Image Before</Text>
                    <View style={{
                        marginHorizontal: 30, borderWidth: 2,
                        borderRadius: 5,
                        borderColor: "rgba(255,255,255,0.5)",
                        marginBottom: 15
                    }}>
                        <ImageBackground
                            source={formData.imageAfter ? { uri: formData.imageAfter } : null}
                            resizeMode='cover'
                            imageStyle={{ width: '100%', height: '100%', objectFit: "cover" }}
                            style={{
                                flex: 1,
                                width: "100%",
                                minHeight: 120,
                                maxHeight: 300
                            }}
                        >
                            <View style={{ flex: 1, flexDirection: "row", borderWidth: 2, alignItems: "flex-end", justifyContent: "space-around" }}>
                                <Pressable style={{ paddingHorizontal: 20 }} onPress={async () => {
                                    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                                    if (!permissionResult) {
                                        Alert.alert('Permission required', 'Permission to access the media library is required.');
                                        return
                                    }
                                    let result = await ImagePicker.launchImageLibraryAsync({
                                        mediaTypes: ['images'],
                                        allowsEditing: true,
                                        quality: 1,
                                        base64: true,
                                    });
                                    if (!result.assets) return
                                    setFormData((prev) => ({ ...prev, imageAfter: result.assets[0].uri }))
                                }} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.30)" }}>
                                    <Icon size={40} source={"image-area"} />
                                </Pressable>
                                <Pressable onPress={() => setFormData((prev) => ({ ...prev, imageAfter: null }))} style={{ display: formData.imageAfter ? "" : "none", paddingHorizontal: 20 }} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.30)" }}>
                                    <Icon size={40} source={"trash-can"} />
                                </Pressable>
                            </View>
                        </ImageBackground>
                    </View>
                    {/* i need to understand the purpose of these buttons and why the api is linked to them being hidden or not */}
                    <View className="mt-5">
                        <Pressable onPress={() => Toast.show({ type: "info", text1: "not implemented yet" })} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} className={`bg-[#8a85ff] border rounded-md p-2 mx-6 my-2`} color="#61dafb">
                            <Text className={`text-[#fff] text-center font-bold text-xl`}>ACCEPT SERVICE</Text>
                        </Pressable>
                        <Pressable onPress={() => Toast.show({ type: "info", text1: "not implemented yet" })} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} className={`bg-[#8a85ff] border rounded-md p-2 mx-6 my-2`} color="#61dafb">
                            <Text className={`text-[#fff] text-center font-bold text-xl`}>REJECT SERVICE</Text>
                        </Pressable>
                        <Pressable onPress={() => Toast.show({ type: "info", text1: "not implemented yet" })} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} className={`bg-[#8a85ff] border rounded-md p-2 mx-6 my-2`} color="#61dafb">
                            <Text className={`text-[#fff] text-center font-bold text-xl`}>CHECKLIST</Text>
                        </Pressable>
                    </View>
                    <TextInput disabled value={String(formData.rejectedReason ?? "")} mode='outlined' label='Rejected Reason' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <ScrollView horizontal>
                        <FlatList
                            data={formData.technicianServicesDetails}
                            style={{ alignSelf: "flex-start", paddingBottom: 50, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 5 }}
                            renderItem={({ item, i }) => TableRow(item, i)}
                            ListHeaderComponent={TableHeader}
                        />
                    </ScrollView>
                    <Pressable onPress={() => handleSendData()} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} className={`bg-[#8a85ff] border rounded-md p-2 mx-3 my-5`} color="#61dafb">
                        <Text className={`text-[#fff] text-center font-bold text-xl`}>Save</Text>
                    </Pressable>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </PaperProvider>
    );
}
const TableHeader = () => {
    return (
        <DataTable.Header style={{ flexShrink: 1 }}>
            <DataTable.Title style={{ width: COLUMN_WIDTH, paddingHorizontal: 5, backgroundColor: "#282C34", flex: 1, flexWrap: 'wrap' }} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Sequence</DataTable.Title>
            <DataTable.Title style={{ width: COLUMN_WIDTH, paddingHorizontal: 5, backgroundColor: "#282C34", flex: 1, flexWrap: 'wrap' }} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Service Type</DataTable.Title>
            <DataTable.Title style={{ width: COLUMN_WIDTH, paddingHorizontal: 5, backgroundColor: "#282C34", flex: 1, flexWrap: 'wrap' }} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Service Type Notes</DataTable.Title>
            <DataTable.Title style={{ width: COLUMN_WIDTH, paddingHorizontal: 5, backgroundColor: "#282C34", flex: 1, flexWrap: 'wrap' }} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Actions</DataTable.Title>
        </DataTable.Header>
    )
}
const TableRow = (record, i) => {
    return (
        <DataTable.Row key={i}>
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
                <Text style={{ color: "white" }}>{record.serviceType}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={{
                width: COLUMN_WIDTH,
                paddingHorizontal: 5,
                backgroundColor: "#282C34"
            }}>
                <Text style={{ color: "white" }}>{record.serviceTypeNotes}</Text>
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
                    <Pressable disabled={true} style={{ marginHorizontal: 5, opacity: 0.15 }} onPress={() => Toast.show({ type: "info", text1: "not implemented yet" })} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }}><Icon source="wrench" size={30} /></Pressable>
                    <Pressable disabled={true} style={{ marginHorizontal: 5, opacity: 0.15 }} onPress={() => Toast.show({ type: "info", text1: "not implemented yet" })} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }}><Icon source="clipboard-check" size={30} /></Pressable>
                </View>
            </DataTable.Cell>
        </DataTable.Row>
    )
}
const DisabledWrapper = ({ label, disabled, children }) => (
    <View style={{ position: "relative" }}>
        {children}
        <Text style={{ color: `rgba(255,255,255,${disabled ? 0.4 : 0.75})` }} className={`absolute top-[0.1rem] left-[1.3rem] z-10 bg-[#282C34] px-2`}>{label}</Text>
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