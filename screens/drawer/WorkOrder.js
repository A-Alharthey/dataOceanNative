import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, FlatList, Platform, StatusBar, Animated } from 'react-native';
import { ActivityIndicator, AnimatedFAB, Avatar, Badge, Button, Card, Chip, DataTable, Divider, FAB, Icon, MD3DarkTheme, Menu, PaperProvider, TextInput } from 'react-native-paper';
import { AppContext } from '../../context/AppContext';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { DatePickerInput } from 'react-native-paper-dates';
import { en, registerTranslation } from 'react-native-paper-dates'
import { SafeAreaView } from 'react-native-safe-area-context';
import { AutocompleteDropdown, AutocompleteDropdownContextProvider } from 'react-native-autocomplete-dropdown';
import { useIsFocused } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import AutoCompleteSelector from '../../Components/AutoCompleteSelector';
registerTranslation('en', en)
const SELECTED_FIELDS = [
    { id: "number", name: "WO Number" },
    { id: "status", name: "Status" },
    { id: "priorityId", name: "Priority" },
    { id: "workOrderDate", name: "WO Date" },
    { id: "dueDate", name: "Due Date" },
    { id: "completedDate", name: "Completed Date" },
    { id: "cancelDate", name: "Cancel Date" },
    { id: "LocationId", name: "Location" },
    { id: "assetItemId", name: "Asset Item" },
    { id: "assetLocationId", name: "Asset Location" },
    { id: "maintenanceRequestId", name: "Maintenance Request" },
    { id: "maintenancePlanId", name: "Maintenance Plan" },
    { id: "cancelBy", name: "Cancelled By" },
    { id: "code", name: "WO Code" },
    { id: "title", name: "Title" },
]
const WorkOrder = (props) => {
    const { token, setLoading, logout, filters } = useContext(AppContext)
    const [tableData, setTableData] = useState([])
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(0)
    const [numOfRecords, SetNumOfRecords] = useState(0)
    const [order, setOrder] = useState({ field: '', direction: 'asc' })
    const isFocused = useIsFocused()
    const [isExtended, setIsExtended] = useState(true)
    const [loadingFooterVisible, setLoadingFooterVisible] = useState(false)
    const [isAllDataLoaded, setIsAllDataLoaded] = useState(false)
    const rotateAnim = useRef(new Animated.Value(0)).current
    const toggleRotate = () => {
        Animated.timing(rotateAnim, {
            toValue: order.direction === "asc" ? 0.5 : 0,
            duration: 300,
            useNativeDriver: true
        }).start();
    };
    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    })
    const { navigation } = props
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
        getTableData()
    }, [pageSize, pageNumber, order])
    useEffect(() => {
        if (isFocused) {
            setPageNumber(0);
            setIsAllDataLoaded(false);
            getTableData();
        }
    }, [isFocused]);
    const getTableData = async () => {
        if (!loadingFooterVisible) setLoading(true)
        const sortingQuery = order.field === null ? "" : `&orderBy=${order.field}&orderDirection=${order.direction}`
        console.log(sortingQuery)
        const response = await fetch(`http://92.205.234.30:7071/api/WorkOrder/GetList?pageSize=${pageSize}${sortingQuery}&pageNumber=${pageNumber + 1}&criteria=${JSON.stringify(filters.workOrder)}`, config).catch((error) => {
            console.log(error)
            Toast.show({ text1: "request went wrong!", type: "error" })
        }).finally(() => setLoading(false))
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
        // console.log(tableData?.length, " current records")
        // console.log(data?.total, " total records")
        // console.log(pageNumber, " page number")
        if (loadingFooterVisible) {
            setTableData((prev) => [...prev, ...(data?.list ?? [])])
            setLoadingFooterVisible(false)
            if (data?.list?.length === 0 || data?.list?.length == undefined) {
                setIsAllDataLoaded(true)
            }
            return
        }
        setTableData(data?.list ?? [])
        SetNumOfRecords(data?.total ?? 0)
    }
    const loadingFooter = () => (
        <View style={{ display: "flex", padding: 10, marginBottom: 25, marginTop: 25, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator animating={loadingFooterVisible} size="large" color="#8a85ff" />
        </View>
    )
    return (
        <KeyboardAvoidingView keyboardVerticalOffset={useHeaderHeight()} behavior={Platform.OS === "ios" ? "padding" : 'height'} style={styles.container}>
            <PaperProvider theme={{ ...MD3DarkTheme }}>
                {/* <Pressable onPress={() => navigation.navigate("WorkOrderFilter")} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} className="bg-[#8a85ff] border rounded-md p-2 m-2" title='New' color="#61dafb">
                    <Text className="text-[#fff] text-center font-bold text-xl">Filter {`(${Object.keys(filters.workOrder).length})`}</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate("WorkOrderEdit")} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} className="bg-[#8a85ff] border rounded-md p-2 m-2" title='New' color="#61dafb">
                    <Text className="text-[#fff] text-center font-bold text-xl">New +</Text>
                </Pressable> */}
                {/* <ScrollView horizontal> */}
                <View style={{ gap: 10, backgroundColor: "transparent", flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 20, paddingVertical: 15, justifyContent: "center" }}>
                    <AutoCompleteSelector onSelected={(item) => setOrder((prev) => ({ ...prev, field: item.id }))} ModalTitle='Sort By' Data={SELECTED_FIELDS} Label='Order By' ButtonStyle={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", borderRadius: 5, gap: 10, flexGrow: 1 }} />
                    <Pressable style={{ justifyContent: 'center', alignItems: 'center', height: 47, width: 47, padding: 5, borderRadius: 5, backgroundColor: "#8a85ff" }} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} onPress={() => (toggleRotate(), setOrder((prev) => ({ ...prev, direction: prev.direction === "asc" ? "desc" : "asc" })))}>
                        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                            <Icon source="arrow-up" size={30} color="#fff" />
                        </Animated.View>
                    </Pressable>
                    <Pressable style={{ justifyContent: 'center', alignItems: 'center', height: 47, width: 47, padding: 5, borderRadius: 5, backgroundColor: "#8a85ff" }} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} onPress={() => navigation.navigate("WorkOrderFilter")}>
                        <Badge visible={Object.keys(filters.workOrder).length > 0} size={21} style={{ position: "absolute", top: -8, right: -8, backgroundColor: "#b3251e", color: "#fff" }}>{Object.keys(filters.workOrder).length}</Badge>
                        <Icon source="filter-variant" size={30} color="#fff" />
                    </Pressable>
                </View>
                <FlatList
                    style={{ width: "100%" }}
                    contentContainerStyle={{ paddingTop: 10 }}
                    renderItem={({ item, i }) => <TableRow item={item} i={i} navigation={navigation} />}
                    data={tableData}
                    onScroll={({ nativeEvent }) => { nativeEvent?.contentOffset?.y > 100 ? setIsExtended(false) : setIsExtended(true) }}
                    ListFooterComponent={loadingFooter}
                    onEndReached={() => (numOfRecords > 0 && !isAllDataLoaded && loadingFooterVisible === false) ? (setLoadingFooterVisible(true), setPageNumber((prev) => prev + 1)) : null}
                />
                <AnimatedFAB
                    icon={'plus'}
                    extended={isExtended}
                    label='New Record'
                    onPress={() => navigation.navigate("WorkOrderEdit")}
                    animateFrom={'right'}
                    iconMode={'dynamic'}
                    style={{ backgroundColor: "#8a85ff", position: "absolute", bottom: 25, right: 25 }}
                />
                {/* <DataTable.Pagination
                            style={{ width: "100%", justifyContent: "center", marginBottom: 100 }}
                            page={pageNumber}
                            numberOfPages={Math.ceil(numOfRecords / pageSize) ?? 0}
                            onPageChange={(page) => setPageNumber(page)}
                            numberOfItemsPerPage={pageSize}
                            numberOfItemsPerPageList={[5, 10, 50, 100]}
                            selectPageDropdownLabel={'Rows per page'}
                            showFastPaginationControls
                            onItemsPerPageChange={(number) => setPageSize(number)}
                        /> */}
                {/* </ScrollView> */}
            </PaperProvider>
        </KeyboardAvoidingView>
    )
}
const TableRow = memo(({ item, i, navigation }) => {
    const [isMenuVisible, setIsMenuVisible] = useState(false)
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const menuButtonRef = useRef(null);
    const statusColors = {
        primary: "#645ced",
        warning: "#ff9820",
        error: "#d32f2f",
        success: "#4caf50"

    };
    const MenuElement = () => (
        <Menu style={{ position: "absolute", top: menuPosition.y, left: menuPosition.x }} visible={isMenuVisible} onDismiss={() => setIsMenuVisible(false)}
            anchor={
                <Pressable android_ripple={{ borderless: true, foreground: true, color: "rgba(255,255,255,0.3)" }} ref={menuButtonRef} onPress={() => {
                    setIsMenuVisible(true);
                    menuButtonRef.current.measure((fx, fy, width, height, px, py) => {
                        setMenuPosition({ x: px - 100, y: py - 70 });
                    });
                }}>
                    <Icon size={25} source="dots-vertical" />
                </Pressable>}>
            <Menu.Item title="Edit" />
            <Menu.Item title="Delete" />
        </Menu>
    )
    return (
        <Card style={{ overflow: "hidden", backgroundColor: "#282C34", marginVertical: 10, marginHorizontal: 20, justifyContent: "center", borderRadius: 8 }} key={i}>
            <View style={{ paddingLeft: 15, paddingBottom: 15, padding: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-around", backgroundColor: statusColors[item.statusCssClass] }}>
                <View style={{ flexGrow: 2, gap: 5 }}>
                    <Text style={{ color: "white", fontSize: 13 }}>WO-{item.number} • {item.code}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
                        <Text style={{ flex: 1, color: "white", fontSize: 23, fontWeight: "bold" }}>{item.title}</Text>
                    </View>
                </View>
                <View style={{ gap: 10, flexDirection: "row", justifyContent: "flex-end", alignItems: "center", flexGrow: 1 }}>
                    <Chip style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>{item.status}</Chip>
                    <MenuElement />
                </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "flex-start", marginVertical: 15, paddingHorizontal: 10, gap: 15 }}>
                <Chip style={{ backgroundColor: statusColors[item.priorityCssClass], marginLeft: 10 }}>{item.priorityId}</Chip>
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                    <View style={{ flexDirection: "row", marginLeft: 5 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                            <Icon size={25} source="map-marker" color="rgba(255,255,255,0.5)" />
                            <View style={{ flexDirection: "column", alignItems: "flex-start", marginLeft: 5, gap: 2 }}>
                                <Text style={{ width: 120, color: "rgba(255,255,255,0.5)" }}>LOCATION</Text>
                                <Text style={{ width: 120, color: "white", fontWeight: "bold" }}>{(item.LocationId || "N/A")}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", marginRight: 25 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                            <Icon size={25} source="calendar" color="rgba(255,255,255,0.5)" />
                            <View style={{ flexDirection: "column", alignItems: "flex-start", marginLeft: 5, gap: 2 }}>
                                <Text style={{ width: 120, color: "rgba(255,255,255,0.5)" }}>WO DATE</Text>
                                <Text style={{ width: 120, color: "white", fontWeight: "bold", }}>{(item.workOrderDate || "N/A")}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                    <View style={{ flexDirection: "row", marginLeft: 5 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                            <Icon size={25} source="calendar" color="rgba(255,255,255,0.5)" />
                            <View style={{ flexDirection: "column", alignItems: "flex-start", marginLeft: 5, gap: 2 }}>
                                <Text style={{ width: 120, color: "rgba(255,255,255,0.5)" }}>DUE DATE</Text>
                                <Text style={{ width: 120, color: "white", fontWeight: "bold", }}>{(item.dueDate || "N/A")}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", marginRight: 25 }}>
                        {/* assuming that the completed date is mutually exclusive with the cancelled date, we would show the appropriate view */}
                        {
                            item.cancelDate ? <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                <Icon size={25} source="calendar-remove-outline" color="rgba(255,255,255,0.5)" />
                                <View style={{ flexDirection: "column", alignItems: "flex-start", marginLeft: 5, gap: 2 }}>
                                    <Text style={{ width: 120, color: "rgba(255,255,255,0.5)" }}>CANCEL DATE</Text>
                                    <Text style={{ width: 120, color: "white", fontWeight: "bold", fontStyle: (item.cancelDate ? "normal" : "italic"), color: (item.cancelDate ? "white" : "rgba(255,255,255,0.5)") }}>{(item.cancelDate || "Active")}</Text>
                                </View>
                            </View> :
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                    <Icon size={25} source={(item.completedDate ? "calendar-check-outline" : "calendar-clock-outline")} color="rgba(255,255,255,0.5)" />
                                    <View style={{ flexDirection: "column", alignItems: "flex-start", marginLeft: 5, gap: 2 }}>
                                        <Text style={{ width: 120, color: "rgba(255,255,255,0.5)" }}>COMPLETED DATE</Text>
                                        <Text style={{ width: 120, color: "white", fontWeight: "bold", fontStyle: (item.completedDate ? "normal" : "italic"), color: (item.completedDate ? "white" : "rgba(255,255,255,0.5)") }}>{(item.completedDate || "Pending")}</Text>
                                    </View>
                                </View>
                        }
                    </View>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                    <View style={{ flexDirection: "row", marginLeft: 5 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                            <Icon size={25} source="package-variant-closed" color="rgba(255,255,255,0.5)" />
                            <View style={{ flexDirection: "column", alignItems: "flex-start", marginLeft: 5, gap: 2 }}>
                                <Text style={{ width: 120, color: "rgba(255,255,255,0.5)" }}>ASSET ITEMS</Text>
                                <Text style={{ width: 120, color: "white", fontWeight: "bold", }}>{(item.assetItemId || "N/A")}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", marginRight: 25 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                            <Icon size={25} source="map-marker" color="rgba(255,255,255,0.5)" />
                            <View style={{ flexDirection: "column", alignItems: "flex-start", marginLeft: 5, gap: 2 }}>
                                <Text style={{ width: 120, color: "rgba(255,255,255,0.5)" }}>ASSET LOCATION</Text>
                                <Text style={{ width: 120, color: "white", fontWeight: "bold", }}>{(item.assetLocationId || "N/A")}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                    <View style={{ flexDirection: "row", marginLeft: 5 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                            <Icon size={25} source="wrench" color="rgba(255,255,255,0.5)" />
                            <View style={{ flexDirection: "column", alignItems: "flex-start", marginLeft: 5, gap: 2 }}>
                                <Text style={{ width: 120, color: "rgba(255,255,255,0.5)" }}>MAINTENANCE REQUEST</Text>
                                <Text style={{ width: 120, color: "white", fontWeight: "bold", }}>{(item.maintenanceRequestId || "N/A")}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", marginRight: 25 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                            <Icon size={25} source="clipboard-text" color="rgba(255,255,255,0.5)" />
                            <View style={{ flexDirection: "column", alignItems: "flex-start", marginLeft: 5, gap: 2 }}>
                                <Text style={{ width: 120, color: "rgba(255,255,255,0.5)" }}>MAINTENANCE PLAN</Text>
                                <Text style={{ width: 120, color: "white", fontWeight: "bold", }}>{(item.maintenancePlanId || "N/A")}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                {
                    item.cancelBy &&
                    <View style={{ flexDirection: "row", alignSelf: "center", marginRight: 35 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                            <Icon size={25} source="close-circle" color="rgba(255,255,255,0.5)" />
                            <View style={{ flexDirection: "column", alignItems: "flex-start", marginLeft: 5, gap: 2 }}>
                                <Text style={{ width: 120, color: "rgba(255,255,255,0.5)" }}>CANCELLED BY</Text>
                                <Text style={{ width: 120, color: "white", fontWeight: "bold", }}>{(item.cancelBy || "N/A")}</Text>
                            </View>
                        </View>
                    </View>
                }
            </View>
        </Card>
    )
})
// const FilterModal = ({ setVisible, visible, componentLoading, suggestions, getSuggestions, setComponentLoading }) => {
//     const [filters, setFilters] = useState({})
//     return (
//         <Modal onBackButtonPress={() => setVisible(false)} isVisible={visible} style={{ justifyContent: "flex-end", margin: 0 }}>
//             <SafeAreaView style={{
//                 backgroundColor: "#282C34",
//                 padding: 20,
//                 borderTopLeftRadius: 15,
//                 borderTopRightRadius: 15,
//             }}>
//                 <View>
//                     <Pressable onPress={() => setVisible(false)} className="self-start" android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }}>
//                         <Icon source="close" size={30} />
//                     </Pressable>
//                 </View>
//                 <KeyboardAwareScrollView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
//                     <TextInput mode='outlined' label='WO Code' style={{ margin: 10, backgroundColor: "transparent" }} />
//                     <View style={{ margin: 10 }}>
//                         <DatePickerInput data style={{ backgroundColor: "transparent" }} mode='outlined' locale='en' label={"From WO Date"} value={filters.workOrderDate} onChange={(d) => setFilters((prev) => ({ ...prev, workOrderDate: d }))} />
//                     </View>
//                     <TextInput mode='outlined' label='From WO Number' style={{ margin: 10, backgroundColor: "transparent" }} />
//                     <AutocompleteDropdownContextProvider>
//                         <AutocompleteDropdown useFilter={false} flatListProps={{ scrollEnabled: false }} loading={componentLoading?.locationId ?? false} onChevronPress={() => getSuggestions(6001, "locationId")} onFocus={() => getSuggestions(6001, "locationId")} dataSet={suggestions?.location} inputContainerStyle={{ margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(255,255,255,0.50)" }} textInputProps={{ placeholderTextColor: "rgba(255,255,255,0.75)", placeholder: "Location", style: { color: "white" } }} />
//                     </AutocompleteDropdownContextProvider>
//                     <AutocompleteDropdownContextProvider>
//                         <AutocompleteDropdown useFilter={false} flatListProps={{ scrollEnabled: false }} loading={componentLoading?.maintenanceTypeId ?? false} onChevronPress={() => getSuggestions(6005, "maintenanceTypeId")} onFocus={() => getSuggestions(6001, "locationId")} dataSet={suggestions?.maintenanceTypeId} inputContainerStyle={{ margin: 10, backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(255,255,255,0.50)" }} textInputProps={{ placeholderTextColor: "rgba(255,255,255,0.75)", placeholder: "Maintenance Type", style: { color: "white" } }} />
//                     </AutocompleteDropdownContextProvider>
//                     <TextInput mode='outlined' label='' style={{ margin: 10, backgroundColor: "transparent" }} />
//                     <TextInput mode='outlined' label='test' style={{ margin: 10, backgroundColor: "transparent" }} />
//                     <TextInput mode='outlined' label='test' style={{ margin: 10, backgroundColor: "transparent" }} />
//                     <TextInput mode='outlined' label='test' style={{ margin: 10, backgroundColor: "transparent" }} />
//                     <TextInput mode='outlined' label='test' style={{ margin: 10, backgroundColor: "transparent" }} />
//                     <TextInput mode='outlined' label='test' style={{ margin: 10, backgroundColor: "transparent" }} />
//                     <TextInput mode='outlined' label='test' style={{ margin: 10, backgroundColor: "transparent" }} />
//                     <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
//                         <Pressable className="bg-[#8a85ff] border rounded-md p-2 flex-1 mx-1 my-2" android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }}>
//                             <Text className="text-[#fff] text-center font-bold text-xl">apply filter</Text>
//                         </Pressable>
//                         <Pressable onPress={() => setComponentLoading((prev) => ({ ...prev, locationid: true }))} className="bg-[#8a85ff] border rounded-md p-2 flex-1 mx-1 my-2" android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }}>
//                             <Text className="text-[#fff] text-center font-bold text-xl">clear filter {filters.test ?? ""}</Text>
//                         </Pressable>
//                     </View>
//                 </KeyboardAwareScrollView>
//             </SafeAreaView>
//         </Modal>
//     )
// }
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1c2025"
    },
    text: {
        fontSize: 24,
    }
});

export default WorkOrder;