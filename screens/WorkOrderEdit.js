import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Platform } from 'react-native';
import { AppContext } from '../context/AppContext';
import Toast from 'react-native-toast-message';
import { Checkbox, MD3DarkTheme, PaperProvider, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { DatePickerInput } from 'react-native-paper-dates';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const WorkOrderEdit = (props) => {
    const { navigation, route } = props
    const { ID } = route.params
    const { setLoading, logout, token } = useContext(AppContext)
    const [formData, setFormData,] = useState({})
    const [suggestions, setSuggestions] = useState({})
    const [componentLoading, setComponentLoading] = useState({})
    const [disabledComponent, setDisabledComponent] = useState({})
    const config = {
        method: "GET",
        headers: {
            "Authorization": `bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
            "FormId": "903005"
        }
    }
    useEffect(() => {
        getLocations()
        if (ID) {
            getDataByID()
        }
    }, [])
    useEffect(() => {
        getMaintenanceRequestByLocation()
    }, [formData.assetLocationId])
    const getDataByID = async () => {
        setLoading(true)
        setDisabledComponent((prev) => ({ ...prev, locationId: true }))
        const response = await fetch(`http://92.205.234.30:7071/api/WorkOrder/GetByID?ID=${ID}`, config).catch((error) => {
            console.log(error)
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
            console.log(error)
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
            console.log(error)
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
        setSuggestions((prev) => ({ ...prev, [name]: suggestionsData.list.map((val) => ({ id: val.ID, title: val.name })) }))
    }
    const getMaintenanceRequestByLocation = async () => {
        if (!(formData.locationId && formData.assetLocationId)) return
        setComponentLoading((prev) => ({ ...prev, assetItemId: true }))
        const response = await fetch(`http://92.205.234.30:7071/api/WorkOrder/GetAllAssetItems?LocationId=${formData.locationId}&assetLocationId=${formData.assetLocationId.valueField}`, config).catch((error) => {
            console.log(error)
            Toast.show({ text1: "request went wrong!", type: "error" })
        }).finally(() => setComponentLoading((prev) => ({ ...prev, assetItemId: false })))
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
        setSuggestions((prev) => ({ ...prev, assetItemId: suggestionsData.list.map((val) => ({ id: val.ID, title: val.name })) }))
    }
    const log = (x) => { console.log(x); return x }
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
                    <TextInput disabled value={String(formData.number ?? "")} mode='outlined' label='WO Code' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <TextInput disabled value={String(formData.code ?? "")} mode='outlined' label='Code' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <DisabledWrapper label={"Location"} disabled={disabledComponent.locationId}>
                        <AutocompleteDropdown key={`${formData.locationId}-${suggestions.locationId?.length}`} showClear={false} loading={componentLoading.locationId} initialValue={formData.locationId ? suggestions.locationId?.find((val) => (val.id === formData.locationId)) : suggestions.locationId?.[0]} dataSet={suggestions.locationId} inputContainerStyle={{ margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${disabledComponent.locationId ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,0.75)`, placeholder: "Location", style: { color: `rgba(255,255,255,${disabledComponent.locationId ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    <TextInput onChangeText={(val) => setFormData((prev) => ({ ...prev, title: val }))} value={String(formData.title ?? "")} mode='outlined' label='Title' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <View style={{ margin: 10 }}>
                        <DatePickerInput style={{ backgroundColor: "transparent" }} mode='outlined' locale='en' label={"From WO Date"} value={formData.workOrderDate ? new Date(formData.workOrderDate) : undefined} onChange={(d) => setFormData((prev) => ({ ...prev, workOrderDate: d }))} />
                    </View>
                    <DisabledWrapper label={"Maintenance Type"} disabled={disabledComponent.maintenanceTypeId}>
                        <AutocompleteDropdown onChevronPress={() => getSuggestions(6005, "maintenanceTypeId")} onFocus={() => getSuggestions(6005, "maintenanceTypeId")} key={`${formData.maintenanceTypeId?.valueField}-${suggestions.maintenanceTypeId?.length}`} showClear={false} loading={componentLoading.maintenanceTypeId} initialValue={formData.maintenanceTypeId ? { id: formData.maintenanceTypeId?.valueField } : undefined} dataSet={suggestions.maintenanceTypeId ? suggestions.maintenanceTypeId : formData.maintenanceTypeId && [{ id: formData.maintenanceTypeId?.valueField, title: formData.maintenanceTypeId?.textField }]} inputContainerStyle={{ margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${disabledComponent.maintenanceTypeId ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,${disabledComponent.maintenanceTypeId ? "0.4" : "0.75"})`, placeholder: "Maintenance Type", style: { color: `rgba(255,255,255,${disabledComponent.maintenanceTypeId ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    <Checkbox.Item onPress={(e) => setFormData((prev) => ({ ...prev, extMaintenance: formData.extMaintenance ? false : true }))} label='External Maintenance' status={formData.extMaintenance ? "checked" : "unchecked"} />
                    <Checkbox.Item onPress={(e) => setFormData((prev) => ({ ...prev, maintenanceRequestId: formData.maintenanceRequestId ? false : true }))} label='Require Requester Confirmation' status={formData.maintenanceRequestId ? "checked" : "unchecked"} />
                    <DisabledWrapper label={"Vendor"} disabled={disabledComponent.vendorId}>
                        <AutocompleteDropdown onChevronPress={() => getSuggestions(6015, "vendorId")} onFocus={() => getSuggestions(6005, "vendorId")} key={`${formData.vendorId?.valueField}-${suggestions.vendorId?.length}`} showClear={false} loading={componentLoading.vendorId} initialValue={formData.vendorId ? { id: formData.vendorId?.valueField } : undefined} dataSet={suggestions.vendorId ? suggestions.vendorId : formData.vendorId && [{ id: formData.vendorId?.valueField, title: formData.vendorId?.textField }]} inputContainerStyle={{ margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${disabledComponent.vendorId ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,${disabledComponent.vendorId ? "0.4" : "0.75"})`, placeholder: "Vendor", style: { color: `rgba(255,255,255,${disabledComponent.vendorId ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    <DisabledWrapper label={"Maintenance Requests"} disabled={true}>
                        <AutocompleteDropdown key={`${formData.maintenanceRequestId?.valueField}-${suggestions.maintenanceRequestId?.length}`} showClear={false} loading={componentLoading.maintenanceRequestId} initialValue={formData.maintenanceRequestId ? { id: formData.maintenanceRequestId?.valueField } : undefined} dataSet={suggestions.maintenanceRequestId ? suggestions.maintenanceRequestId : formData.maintenanceRequestId && [{ id: formData.maintenanceRequestId?.valueField, title: formData.maintenanceRequestId?.textField }]} inputContainerStyle={{ margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${true ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,${true ? "0.4" : "0.75"})`, placeholder: "Maintenance Requests", style: { color: `rgba(255,255,255,${true ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    <DisabledWrapper label={"Asset Items Location"} disabled={formData.disableWOAssets}>
                        <AutocompleteDropdown onChevronPress={() => getSuggestions(707, "assetLocationId")} onFocus={() => getSuggestions(707, "assetLocationId")} key={`${formData.assetLocationId?.valueField}-${suggestions.assetLocationId?.length}`} loading={componentLoading.assetLocationId} initialValue={formData.assetLocationId ? { id: formData.assetLocationId?.valueField } : undefined} dataSet={suggestions.assetLocationId} inputContainerStyle={{ margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${formData.disableWOAssets ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,${formData.disableWOAssets ? "0.4" : "0.75"})`, placeholder: "Asset Items Location", style: { color: `rgba(255,255,255,${formData.disableWOAssets ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                    {/**fix asset items it has to synchronize with assetitems location */}
                    <DisabledWrapper label={"Asset Items"} disabled={formData.disableWOAssets}>
                        <AutocompleteDropdown key={`${formData.assetItemId}-${suggestions.assetItemId?.length}`} showClear={false} loading={componentLoading.assetItemId} initialValue={formData.assetItemId ? { id: formData.assetItemId } : undefined} dataSet={suggestions.assetItemId ? suggestions.assetItemId : formData.assetItemId && [{ id: formData.assetItemId, title: formData.assetLocationId?.textField }]} inputContainerStyle={{ margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: `rgba(255,255,255,${formData.disableWOAssets ? "rgba(255,255,255,0.2)" : "0.5"})` }} textInputProps={{ placeholderTextColor: `rgba(255,255,255,${formData.disableWOAssets ? "0.4" : "0.75"})`, placeholder: "Asset Items Location", style: { color: `rgba(255,255,255,${formData.disableWOAssets ? "rgba(255,255,255,0.4)" : "1"})` } }} />
                    </DisabledWrapper>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </PaperProvider>
    )
};
const DisabledWrapper = ({ label, disabled, children }) => (
    <View style={{ position: "relative" }}>
        {children}
        <Text className="absolute top-[0.1rem] left-[1.3rem] z-10 bg-[#282C34] color-[rgba(255,255,255,0.75)] px-2">{label}</Text>
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