import { useContext, useEffect, useRef, useState } from "react"
import { Platform, Pressable, Text, View } from "react-native"
import { AutocompleteDropdown, AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown"
import { KeyboardAvoidingView, KeyboardAwareScrollView } from "react-native-keyboard-controller"
import { Divider, Icon, MD3DarkTheme, PaperProvider, TextInput } from "react-native-paper"
import { DatePickerInput } from "react-native-paper-dates"
import { SafeAreaView } from "react-native-safe-area-context"
import { AppContext } from "../context/AppContext"
import { useHeaderHeight } from '@react-navigation/elements';
import AutoCompleteSelector from "../Components/AutoCompleteSelector"

const WorkOrderFilter = (props) => {
    const [suggestions, setSuggetions] = useState({})
    const [componentLoading, setComponentLoading] = useState({})
    const locationRef = useRef(null)
    const MaintenanceTypeRef = useRef(null)
    const PriorityRef = useRef(null)
    const statusRef = useRef(null)
    const { navigation } = props
    const { filters, setFilters, token } = useContext(AppContext)
    const isInitialMount = useRef(true);
    useEffect(() => {
        isInitialMount.current = false;
        getSuggestions(6001, "locationId")
        getSuggestions(6005, "maintenanceTypeId")
        getSuggestions(6004, "priorityId")
        getSuggestions(6010, "status")
    }, []);
    const config = {
        method: "GET",
        headers: {
            "Authorization": `bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
            "FormId": "903005"
        }
    }
    const getSuggestions = async (id, name) => {
        if (suggestions[name]) return
        setComponentLoading((prev) => ({ ...prev, [name]: true }))
        const response = await fetch(`http://92.205.234.30:7071/api/General/Search?SearchID=${id}&loadLimit=100`, config).finally(() => setComponentLoading((prev) => ({ ...prev, [name]: false })))
        if (!response.ok) {
            if (response.status == 401) {
                Toast.show({ text1: "Session Expired", type: "error" })
                logout()
                return
            }
            response.text().then((res) => { console.log(res) })
            Toast.show({ text1: "something went wrong!", type: "error" })
            return
        }
        const data = await response.json()
        const dataset = data.list.map(({ ID, name, searchField }) => ({ id: ID, name: name, searchField }))
        setSuggetions((prev) => ({ ...prev, [name]: dataset }))
    }
    const handleOnSelectItem = (item, label) => {
        console.log(item)
        setFilters((prev) => {
            if (item.id == null) {
                const { [label]: removed, ...rest } = prev.workOrder
                return { ...prev, workOrder: rest }
            }
            return { ...prev, workOrder: { ...prev.workOrder, [label]: { valueField: item.id, textField: item.name } } }
        })
    }
    return (
        <KeyboardAvoidingView keyboardVerticalOffset={useHeaderHeight()} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <PaperProvider theme={{ ...MD3DarkTheme }}>
                <SafeAreaView style={{
                    backgroundColor: "#282C34",
                    padding: 5,
                    flex: 1,
                }}>
                    <KeyboardAwareScrollView bottomOffset={80} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 20 }}>
                        <Text style={{ color: "white", fontSize: 20, margin: 5, marginLeft: 20 }}>Search</Text>
                        <TextInput value={filters.workOrder.code ?? ""} onChangeText={(val) => setFilters((prev) => ({ ...prev, workOrder: val ? { ...prev.workOrder, code: val } : ((({ code, ...rest }) => rest)(prev.workOrder)) }))} mode='outlined' label='WO Code' style={{ margin: 5, marginHorizontal: 25, backgroundColor: "transparent" }} />
                        <TextInput value={filters.workOrder.number ?? ""} onChangeText={(val) => setFilters((prev) => ({ ...prev, workOrder: val ? { ...prev.workOrder, number: val } : ((({ number, ...rest }) => rest)(prev.workOrder)) }))} mode='outlined' label='WO Number' style={{ margin: 5, marginHorizontal: 25, backgroundColor: "transparent" }} />
                        <TextInput value={filters.workOrder.title ?? ""} onChangeText={(val) => setFilters((prev) => ({ ...prev, workOrder: val ? { ...prev.workOrder, title: val } : ((({ title, ...rest }) => rest)(prev.workOrder)) }))} mode='outlined' label='WO Title' style={{ margin: 5, marginHorizontal: 25, backgroundColor: "transparent" }} />
                        <Divider style={{ marginVertical: 20, marginHorizontal: 27, backgroundColor: "rgba(255,255,255,0.5)" }} />
                        <Text style={{ color: "white", fontSize: 20, margin: 5, marginLeft: 20 }}>Filter By</Text>
                        <AutoCompleteSelector ModalTitle="Select Location" ValueId={filters.workOrder.locationId?.valueField} onSelected={(item) => handleOnSelectItem(item, "locationId")} Data={suggestions.locationId ?? null} ButtonStyle={{ marginHorizontal: 25, paddingVertical: 13 }} LabelStyle={{ backgroundColor: "#282C34", padding: 5 }} Label="Location" />
                        <AutoCompleteSelector ModalTitle="Select Maintenance Type" ValueId={filters.workOrder.maintenanceTypeId?.valueField} onSelected={(item) => handleOnSelectItem(item, "maintenanceTypeId")} Data={suggestions.maintenanceTypeId ?? null} ButtonStyle={{ marginHorizontal: 25, paddingVertical: 13 }} LabelStyle={{ backgroundColor: "#282C34", padding: 5 }} Label="Maintenance Type" />
                        <AutoCompleteSelector ModalTitle="Select Priority" ValueId={filters.workOrder.priorityId?.valueField} onSelected={(item) => handleOnSelectItem(item, "priorityId")} Data={suggestions.priorityId ?? null} ButtonStyle={{ marginHorizontal: 25, paddingVertical: 13 }} LabelStyle={{ backgroundColor: "#282C34", padding: 5 }} Label="Priority" />
                        <AutoCompleteSelector ModalTitle="Select Status" ValueId={filters.workOrder.status?.valueField} onSelected={(item) => handleOnSelectItem(item, "status")} Data={suggestions.status ?? null} ButtonStyle={{ marginHorizontal: 25, paddingVertical: 13 }} LabelStyle={{ backgroundColor: "#282C34", padding: 5 }} Label="Status" />
                        <Divider style={{ marginVertical: 30, marginHorizontal: 27, backgroundColor: "rgba(255,255,255,0.5)" }} />
                        <Text style={{ color: "white", fontSize: 20, marginLeft: 20 }}>Work Order Number Range</Text>
                        <View style={{ flexDirection: "row", gap: 10, marginHorizontal: 25, marginTop: 15 }}>
                            <TextInput value={filters.workOrder.fromNumber ?? ""} onChangeText={(val) => setFilters((prev) => ({ ...prev, workOrder: val ? { ...prev.workOrder, fromNumber: val } : ((({ fromNumber, ...rest }) => rest)(prev.workOrder)) }))} mode='outlined' label='From WO Number' style={{ backgroundColor: "transparent", flexGrow: 1 }} />
                            <TextInput value={filters.workOrder.toNumber ?? ""} onChangeText={(val) => setFilters((prev) => ({ ...prev, workOrder: val ? { ...prev.workOrder, toNumber: val } : ((({ toNumber, ...rest }) => rest)(prev.workOrder)) }))} mode='outlined' label='To WO Number' style={{ backgroundColor: "transparent", flexGrow: 1 }} />
                        </View>
                        <Divider style={{ marginVertical: 30, marginHorizontal: 27, backgroundColor: "rgba(255,255,255,0.5)" }} />
                        <Text style={{ color: "white", fontSize: 20, marginLeft: 20 }}>Date Range</Text>
                        {/* <AutocompleteDropdown controller={(instance) => { locationRef.current = instance }} initialValue={filters.workOrder?.locationId && { id: filters.workOrder.locationId.valueField, title: filters.workOrder.locationId.textField }} onSelectItem={(item) => handleOnSelectItem(item, "locationId")} useFilter={false} loading={componentLoading?.locationId ?? false} onChevronPress={() => getSuggestions(6001, "locationId")} onFocus={() => getSuggestions(6001, "locationId")} dataSet={suggestions.locationId ?? null} inputContainerStyle={{ height: 45, margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(255,255,255,0.50)" }} textInputProps={{ placeholderTextColor: "rgba(255,255,255,0.75)", placeholder: "Location", style: { color: "white" } }} />
                    <AutocompleteDropdown controller={(instance) => { MaintenanceTypeRef.current = instance }} initialValue={filters.workOrder?.maintenanceTypeId && { id: filters.workOrder.maintenanceTypeId.valueField, title: filters.workOrder.maintenanceTypeId.textField }} onSelectItem={(item) => handleOnSelectItem(item, "maintenanceTypeId")} useFilter={false} loading={componentLoading?.maintenanceTypeId ?? false} onChevronPress={() => getSuggestions(6005, "maintenanceTypeId")} onFocus={() => getSuggestions(6005, "maintenanceTypeId")} dataSet={suggestions?.maintenanceTypeId} inputContainerStyle={{ height: 45, margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(255,255,255,0.50)" }} textInputProps={{ placeholderTextColor: "rgba(255,255,255,0.75)", placeholder: "Maintenance Type", style: { color: "white" } }} />
                    <AutocompleteDropdown controller={(instance) => { PriorityRef.current = instance }} initialValue={filters.workOrder?.priorityId && { id: filters.workOrder.priorityId.valueField, title: filters.workOrder.priorityId.textField }} onSelectItem={(item) => handleOnSelectItem(item, "priorityId")} useFilter={false} loading={componentLoading?.priorityId ?? false} onChevronPress={() => getSuggestions(6004, "priorityId")} onFocus={() => getSuggestions(6004, "priorityId")} dataSet={suggestions.priorityId ?? null} inputContainerStyle={{ height: 45, margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(255,255,255,0.50)" }} textInputProps={{ placeholderTextColor: "rgba(255,255,255,0.75)", placeholder: "Priority", style: { color: "white" } }} />
                    <AutocompleteDropdown controller={(instance) => { statusRef.current = instance }} initialValue={filters.workOrder?.status && { id: filters.workOrder.status.valueField, title: filters.workOrder.status.textField }} onSelectItem={(item) => handleOnSelectItem(item, "status")} useFilter={false} loading={componentLoading?.status ?? false} onChevronPress={() => getSuggestions(6010, "status")} onFocus={() => getSuggestions(6010, "status")} dataSet={suggestions.status ?? null} inputContainerStyle={{ height: 45, margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(255,255,255,0.50)" }} textInputProps={{ placeholderTextColor: "rgba(255,255,255,0.75)", placeholder: "status", style: { color: "white" } }} /> */}
                        <View style={{ flexDirection: "row", marginTop: 15, gap: 10, marginHorizontal: 25, marginBottom: 50 }}>
                            <View style={{ width: 155 }}>
                                <DatePickerInput style={{ backgroundColor: "transparent" }} mode='outlined' locale='en' label={"From WO Date"} value={filters.workOrder.workOrderDate ?? undefined} onChangeText={(val) => { return val === "" ? (setFilters((prev) => ({ workOrder: ((({ workOrderDate, ...rest }) => rest)(prev.workOrder)) }))) : "" }} onChange={(d) => setFilters((prev) => ({ ...prev, workOrder: { ...prev.workOrder, workOrderDate: d } }))} />
                            </View>
                            {/**todo do the autocomplete with filter in consideration */}
                            <View style={{ width: 155 }}>
                                <DatePickerInput style={{ backgroundColor: "transparent" }} mode='outlined' locale='en' label={"To WO Date"} value={filters.workOrder.toDate ?? undefined} onChangeText={(val) => { return val === "" ? (setFilters((prev) => ({ workOrder: ((({ toDate, ...rest }) => rest)(prev.workOrder)) }))) : "" }} onChange={(d) => setFilters((prev) => ({ ...prev, workOrder: { ...prev.workOrder, toDate: d } }))} />
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                    <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                        <Pressable onPress={() => navigation.goBack()} className="bg-[#8a85ff] border rounded-md p-2 flex-1 mx-1 my-2" android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }}>
                            <Text className="text-[#fff] text-center font-bold text-xl">apply filter {`(${Object.keys(filters.workOrder).length})`}</Text>
                        </Pressable>
                        <Pressable onPress={() => {
                            setFilters((prev) => ({ ...prev, workOrder: {} }))
                        }} className="bg-[#8a85ff] border rounded-md p-2 flex-1 mx-1 my-2" android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }}>
                            <Text className="text-[#fff] text-center font-bold text-xl">clear filter</Text>
                        </Pressable>
                    </View>
                </SafeAreaView>
            </PaperProvider>
        </KeyboardAvoidingView>
    )
}

export default WorkOrderFilter