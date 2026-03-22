import React, { memo, useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, FlatList, Platform, StatusBar } from 'react-native';
import { Button, DataTable, Icon, MD3DarkTheme, PaperProvider, TextInput } from 'react-native-paper';
import { AppContext } from '../../context/AppContext';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { DatePickerInput } from 'react-native-paper-dates';
import { en, registerTranslation } from 'react-native-paper-dates'
import { SafeAreaView } from 'react-native-safe-area-context';
import { AutocompleteDropdown, AutocompleteDropdownContextProvider } from 'react-native-autocomplete-dropdown';
import { useIsFocused } from '@react-navigation/native';
registerTranslation('en', en)
const COLUMN_WIDTH = 250
const TechnicianServices = (props) => {
    const { token, setLoading, logout, filters } = useContext(AppContext)
    const [tableData, setTableData] = useState([])
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(0)
    const [numOfRecords, SetNumOfRecords] = useState(0)
    const [order, setOrder] = useState({})
    const isFocused = useIsFocused()
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
        if (isFocused) {
            getTableData()
        }
    }, [pageNumber, pageSize, filters, isFocused, order])
    const getTableData = async () => {
        setLoading(true)
        const direction = order.direction === "" ? "" : (order.direction === "ascending" ? "asc" : "desc")
        const sortingQuery = direction === "" ? "" : `&orderBy=${order.field}&orderDirection=${direction}`
        const response = await fetch(`http://92.205.234.30:7071/api/TechnicianServices/GetList?pageSize=${pageSize}${sortingQuery}&pageNumber=${pageNumber + 1}&criteria=${JSON.stringify(filters.technician)}`, config).catch((error) => {
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
        setTableData(data.list)
        SetNumOfRecords(data.total)
    }
    const sortBy = (field) => {
        setOrder((prev) => {
            let nextDirection = "";
            if (prev.field !== field) {
                nextDirection = "ascending";
            } else {
                if (prev.direction === "") nextDirection = "ascending";
                else if (prev.direction === "ascending") nextDirection = "descending";
                else nextDirection = "";
            }

            return { field, direction: nextDirection };
        });
    };
    const TableHeader = () => {
        return (
            <DataTable.Header>
                <DataTable.Title style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Actions</DataTable.Title>
                <DataTable.Title android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} onPress={() => sortBy("serviceTypeGroupSequence")} sortDirection={order.field === "serviceTypeGroupSequence" ? order.direction : ""} style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Service Type Group Sequence</DataTable.Title>
                <DataTable.Title android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} onPress={() => sortBy("serviceTypeGroupId")} sortDirection={order.field === "serviceTypeGroupId" ? order.direction : ""} style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Service Type Group</DataTable.Title>
                <DataTable.Title android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} onPress={() => sortBy("status")} sortDirection={order.field === "status" ? order.direction : ""} style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Service Type Group Status</DataTable.Title>
                <DataTable.Title android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} onPress={() => sortBy("technicianId")} sortDirection={order.field === "technicianId" ? order.direction : ""} style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Assign To Technician</DataTable.Title>
                <DataTable.Title android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} onPress={() => sortBy("completedDate")} sortDirection={order.field === "completedDate" ? order.direction : ""} style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Completed Date</DataTable.Title>
                <DataTable.Title android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} onPress={() => sortBy("technicianNotes")} sortDirection={order.field === "technicianNotes" ? order.direction : ""} style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Technician Notes</DataTable.Title>
                <DataTable.Title android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} onPress={() => sortBy("number")} sortDirection={order.field === "number" ? order.direction : ""} style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>WO Number</DataTable.Title>
                <DataTable.Title android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} onPress={() => sortBy("code")} sortDirection={order.field === "code" ? order.direction : ""} style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>WO Code</DataTable.Title>
                <DataTable.Title android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} onPress={() => sortBy("title")} sortDirection={order.field === "title" ? order.direction : ""} style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Title</DataTable.Title>
                <DataTable.Title android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} onPress={() => sortBy("LocationId")} sortDirection={order.field === "LocationId" ? order.direction : ""} style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Location</DataTable.Title>
                <DataTable.Title android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} onPress={() => sortBy("workOrderDate")} sortDirection={order.field === "workOrderDate" ? order.direction : ""} style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Work Order Date</DataTable.Title>
                <DataTable.Title android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} onPress={() => sortBy("dueDate")} sortDirection={order.field === "dueDate" ? order.direction : ""} style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>WO Due Date</DataTable.Title>
                <DataTable.Title android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} onPress={() => sortBy("assetItemId")} sortDirection={order.field === "assetItemId" ? order.direction : ""} style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Asset Items</DataTable.Title>
                <DataTable.Title android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} onPress={() => sortBy("maintenanceRequestId")} sortDirection={order.field === "maintenanceRequestId" ? order.direction : ""} style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Maintenance Requests</DataTable.Title>
            </DataTable.Header>
        )
    }
    return (
        <View style={styles.container}>
            <PaperProvider theme={{ ...MD3DarkTheme }}>
                <Pressable onPress={() => navigation.navigate("TechnicianFilter")} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} className="bg-[#8a85ff] border rounded-md p-2 m-2" title='New' color="#61dafb">
                    <Text className="text-[#fff] text-center font-bold text-xl">Filter {`(${Object.keys(filters.technician).length})`}</Text>
                </Pressable>
                <ScrollView horizontal>
                    <View>
                        <FlatList
                            style={{ alignSelf: "flex-start" }}
                            renderItem={({ item, i }) => <TableRow item={item} i={i} navigation={navigation} />}
                            ListHeaderComponent={TableHeader}
                            data={tableData}
                            stickyHeaderIndices={[0]}

                        />
                        <DataTable.Pagination
                            style={{ width: "100%", justifyContent: "flex-start", marginBottom: 100 }}
                            page={pageNumber}
                            numberOfPages={Math.ceil(numOfRecords / pageSize) ?? 0}
                            onPageChange={(page) => setPageNumber(page)}
                            numberOfItemsPerPage={pageSize}
                            numberOfItemsPerPageList={[5, 10, 50, 100]}
                            selectPageDropdownLabel={'Rows per page'}
                            showFastPaginationControls
                            onItemsPerPageChange={(number) => setPageSize(number)}
                        />
                    </View>
                </ScrollView>
            </PaperProvider>
        </View>
    )
}
const TableRow = memo(({ item, i, navigation }) => {
    return (
        <DataTable.Row key={i}>
            <DataTable.Cell style={styles.column}>
                <Pressable onPress={() => navigation.navigate("TechnicianEdit", { ID: item.ID })} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }}><Icon source="arrow-right" size={30} /></Pressable>
            </DataTable.Cell>
            <DataTable.Cell style={styles.column}>
                <Text style={{ color: "white" }}>{item.serviceTypeGroupSequence}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.column}>
                <Text style={{ color: "white" }}>{item.serviceTypeGroupId}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.column}>
                <Text style={{ color: "white" }}>{item.status}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.column}>
                <Text style={{ color: "white" }}>{item.technicianId}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.column}>
                <Text style={{ color: "white" }}>{item.completedDate}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.column}>
                <Text style={{ color: "white" }}>{item.technicianNotes}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.column}>
                <Text style={{ color: "white" }}>{item.number}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.column}>
                <Text style={{ color: "white" }}>{item.code}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.column}>
                <Text style={{ color: "white" }}>{item.title}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.column}>
                <Text style={{ color: "white" }}>{item.LocationId}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.column}>
                <Text style={{ color: "white" }}>{item.workOrderDate}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.column}>
                <Text style={{ color: "white" }}>{item.dueDate}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.column}>
                <Text style={{ color: "white" }}>{item.assetItemId}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={styles.column}>
                <Text style={{ color: "white" }}>{item.maintenanceRequestId}</Text>
            </DataTable.Cell>
        </DataTable.Row>
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
        backgroundColor: "#282C34"
    },
    text: {
        fontSize: 24,
    },
    column: {
        width: COLUMN_WIDTH,
        paddingHorizontal: 5,
        backgroundColor: "#282C34"
    }
});

export default TechnicianServices;