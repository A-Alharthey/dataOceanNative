import { useContext, useEffect, useRef, useState } from "react"
import { Platform, Pressable, Text, View } from "react-native"
import { AutocompleteDropdown, AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown"
import { KeyboardAwareScrollView } from "react-native-keyboard-controller"
import { Icon, MD3DarkTheme, PaperProvider, TextInput } from "react-native-paper"
import { DatePickerInput } from "react-native-paper-dates"
import { SafeAreaView } from "react-native-safe-area-context"
import { AppContext } from "../context/AppContext"

const TechnicianFilter = (props) => {
    const [suggestions, setSuggetions] = useState({})
    const [componentLoading, setComponentLoading] = useState({})
    const locationRef = useRef(null)
    const serviceTypeGroupRef = useRef(null)
    const statusRef = useRef(null)
    const technicianRef = useRef(null)
    const { navigation } = props
    const { filters, setFilters, token } = useContext(AppContext)
    const isInitialMount = useRef(true);
    useEffect(() => {
        isInitialMount.current = false;
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
        const dataset = data.list.map(({ ID, name, searchField }) => ({ id: ID, title: name, searchField }))
        console.log(dataset)
        setSuggetions((prev) => ({ ...prev, [name]: dataset }))
    }
    const handleOnSelectItem = (item, label) => {
        if (isInitialMount.current && !item) return
        setFilters((prev) => {
            const current = prev.technician?.[label]?.valueField
            if (item && current === item.id) return prev
            if (!item) {
                const { [label]: removed, ...rest } = prev.technician
                return { ...prev, technician: rest }
            }
            return { ...prev, technician: { ...prev.technician, [label]: { valueField: item.id, textField: item.title } } }
        })
    }
    return (
        <PaperProvider theme={{ ...MD3DarkTheme }}>
            <SafeAreaView style={{
                backgroundColor: "#282C34",
                padding: 5,
            }}>
                <KeyboardAwareScrollView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <TextInput value={filters.technician.code ?? ""} onChangeText={(val) => setFilters((prev) => ({ ...prev, technician: val ? { ...prev.technician, code: val } : ((({ code, ...rest }) => rest)(prev.technician)) }))} mode='outlined' label='WO Code' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <View style={{ margin: 10 }}>
                        <DatePickerInput style={{ backgroundColor: "transparent" }} mode='outlined' locale='en' label={"From WO Date"} value={filters.technician.workOrderDate ?? undefined} onChangeText={(val) => { return val === "" ? (setFilters((prev) => ({ technician: ((({ workOrderDate, ...rest }) => rest)(prev.technician)) }))) : "" }} onChange={(d) => setFilters((prev) => ({ ...prev, technician: { ...prev.technician, workOrderDate: d } }))} />
                    </View>
                    <TextInput value={filters.technician.fromNumber ?? ""} onChangeText={(val) => setFilters((prev) => ({ ...prev, technician: val ? { ...prev.technician, fromNumber: val } : ((({ fromNumber, ...rest }) => rest)(prev.technician)) }))} mode='outlined' label='From WO Number' style={{ margin: 10, backgroundColor: "transparent" }} />
                    {/**todo do the autocomplete with filter in consideration */}
                    <AutocompleteDropdown controller={(instance) => { locationRef.current = instance }} initialValue={filters.technician?.locationId && { id: filters.technician.locationId.valueField, title: filters.technician.locationId.textField }} onSelectItem={(item) => handleOnSelectItem(item, "locationId")} useFilter={false} loading={componentLoading?.locationId ?? false} onChevronPress={() => getSuggestions(6001, "locationId")} onFocus={() => getSuggestions(6001, "locationId")} dataSet={suggestions.locationId ?? null} inputContainerStyle={{ margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(255,255,255,0.50)" }} textInputProps={{ placeholderTextColor: "rgba(255,255,255,0.75)", placeholder: "Location", style: { color: "white" } }} />
                    <TextInput value={filters.technician.number ?? ""} onChangeText={(val) => setFilters((prev) => ({ ...prev, technician: val ? { ...prev.technician, number: val } : ((({ number, ...rest }) => rest)(prev.technician)) }))} mode='outlined' label='WO Number' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <AutocompleteDropdown controller={(instance) => { serviceTypeGroupRef.current = instance }} initialValue={filters.technician?.serviceTypeGroupId && { id: filters.technician.serviceTypeGroupId.valueField, title: filters.technician.serviceTypeGroupId.textField }} onSelectItem={(item) => handleOnSelectItem(item, "serviceTypeGroupId")} useFilter={false} loading={componentLoading?.serviceTypeGroupId ?? false} onChevronPress={() => getSuggestions(6006, "serviceTypeGroupId")} onFocus={() => getSuggestions(6006, "serviceTypeGroupId")} dataSet={suggestions?.serviceTypeGroupId} inputContainerStyle={{ margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(255,255,255,0.50)" }} textInputProps={{ placeholderTextColor: "rgba(255,255,255,0.75)", placeholder: "Service Type Group", style: { color: "white" } }} />
                    <AutocompleteDropdown controller={(instance) => { statusRef.current = instance }} initialValue={filters.technician?.status && { id: filters.technician.status.valueField, title: filters.technician.status.textField }} onSelectItem={(item) => handleOnSelectItem(item, "status")} useFilter={false} loading={componentLoading?.status ?? false} onChevronPress={() => getSuggestions(6008, "status")} onFocus={() => getSuggestions(6008, "status")} dataSet={suggestions.status ?? null} inputContainerStyle={{ margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(255,255,255,0.50)" }} textInputProps={{ placeholderTextColor: "rgba(255,255,255,0.75)", placeholder: "Service Type Group Status", style: { color: "white" } }} />
                    <AutocompleteDropdown controller={(instance) => { technicianRef.current = instance }} initialValue={filters.technician?.technicianId && { id: filters.technician.technicianId.valueField, title: filters.technician.technicianId.textField }} onSelectItem={(item) => handleOnSelectItem(item, "technicianId")} useFilter={false} loading={componentLoading?.technicianId ?? false} onChevronPress={() => getSuggestions(6007, "technicianId")} onFocus={() => getSuggestions(6007, "technicianId")} dataSet={suggestions.technicianId ?? null} inputContainerStyle={{ margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(255,255,255,0.50)" }} textInputProps={{ placeholderTextColor: "rgba(255,255,255,0.75)", placeholder: "Assign To Technician", style: { color: "white" } }} />
                    <TextInput value={filters.technician.title ?? ""} onChangeText={(val) => setFilters((prev) => ({ ...prev, technician: val ? { ...prev.technician, title: val } : ((({ title, ...rest }) => rest)(prev.technician)) }))} mode='outlined' label='WO Title' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <View style={{ margin: 10 }}>
                        <DatePickerInput style={{ backgroundColor: "transparent" }} mode='outlined' locale='en' label={"To WO Date"} value={filters.technician.toDate ?? undefined} onChangeText={(val) => { return val === "" ? (setFilters((prev) => ({ technician: ((({ toDate, ...rest }) => rest)(prev.technician)) }))) : "" }} onChange={(d) => setFilters((prev) => ({ ...prev, technician: { ...prev.technician, toDate: d } }))} />
                    </View>
                    <TextInput value={filters.technician.toNumber ?? ""} onChangeText={(val) => setFilters((prev) => ({ ...prev, technician: val ? { ...prev.technician, toNumber: val } : ((({ toNumber, ...rest }) => rest)(prev.technician)) }))} mode='outlined' label='To WO Number' style={{ margin: 10, backgroundColor: "transparent" }} />
                    <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                        <Pressable onPress={() => navigation.goBack()} className="bg-[#8a85ff] border rounded-md p-2 flex-1 mx-1 my-2" android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }}>
                            <Text className="text-[#fff] text-center font-bold text-xl">apply filter {`(${Object.keys(filters.technician).length})`}</Text>
                        </Pressable>
                        <Pressable onPress={() => {
                            setFilters((prev) => ({ ...prev, technician: {} }))
                            locationRef.current.clear()
                            serviceTypeGroupRef.current.clear()
                            statusRef.current.clear()
                            technicianRef.current.clear()
                        }} className="bg-[#8a85ff] border rounded-md p-2 flex-1 mx-1 my-2" android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }}>
                            <Text className="text-[#fff] text-center font-bold text-xl">clear filter</Text>
                        </Pressable>
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </PaperProvider>
    )
}

export default TechnicianFilter