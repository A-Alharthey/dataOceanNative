import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, FlatList } from 'react-native';
import { DataTable, Icon, MD3DarkTheme, PaperProvider } from 'react-native-paper';
import { AppContext } from '../../context/AppContext';
import Toast from 'react-native-toast-message';
const COLUMN_WIDTH = 200
const WorkOrder = () => {
    const { token, setLoading, logout } = useContext(AppContext)
    const [tableData, setTableData] = useState([])
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(0)
    useEffect(() => {
        getTableData()
    }, [pageNumber, pageSize])
    const getTableData = async () => {
        const config = {
            method: "GET",
            headers: {
                "Authorization": `bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json",
                "FormId": "903005"
            }
        }
        setLoading(true)
        const response = await fetch(`http://92.205.234.30:7071/api/WorkOrder/GetList?pageSize=${pageSize}&pageNumber=${pageNumber + 1}`, config).catch((error) => {
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
    }
    const TableRow = ({ item, i }) => {
        return (
            <DataTable.Row key={i}>
                <DataTable.Cell style={styles.column}>
                    <Pressable android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }}><Icon source="arrow-right" size={30} /></Pressable>
                </DataTable.Cell>
                <DataTable.Cell style={styles.column}>
                    <Text style={{ color: "white" }}>{item.number}</Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.column}>
                    <Text style={{ color: "white" }}>{item.code}</Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.column}>
                    <Text style={{ color: "white" }}>{item.status}</Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.column}>
                    <Text style={{ color: "white" }}>{item.priorityId}</Text>
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
                    <Text style={{ color: "white" }}>{item.completedDate}</Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.column}>
                    <Text style={{ color: "white" }}>{item.dueDate}</Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.column}>
                    <Text style={{ color: "white" }}>{item.assetItemId}</Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.column}>
                    <Text style={{ color: "white" }}>{item.assetLocationId}</Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.column}>
                    <Text style={{ color: "white" }}>{item.maintenanceRequestId}</Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.column}>
                    <Text style={{ color: "white" }}>{item.maintenancePlanId}</Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.column}>
                    <Text style={{ color: "white" }}>{item.cancelDate}</Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.column}>
                    <Text style={{ color: "white" }}>{item.cancelBy}</Text>
                </DataTable.Cell>
            </DataTable.Row>
        )
    }
    const TableHeader = () => {
        return (
            <DataTable.Header>
                <DataTable.Title style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Actions</DataTable.Title>
                <DataTable.Title style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Number</DataTable.Title>
                <DataTable.Title style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Code</DataTable.Title>
                <DataTable.Title style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Status</DataTable.Title>
                <DataTable.Title style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Priority</DataTable.Title>
                <DataTable.Title style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Title</DataTable.Title>
                <DataTable.Title style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Location</DataTable.Title>
                <DataTable.Title style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Work Order Date</DataTable.Title>
                <DataTable.Title style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Completed Date</DataTable.Title>
                <DataTable.Title style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Due Date</DataTable.Title>
                <DataTable.Title style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Asset Items</DataTable.Title>
                <DataTable.Title style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Asset Items Location</DataTable.Title>
                <DataTable.Title style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Maintenance Requests</DataTable.Title>
                <DataTable.Title style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Maintenance Plan</DataTable.Title>
                <DataTable.Title style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Cancel Date</DataTable.Title>
                <DataTable.Title style={styles.column} textStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Cancel By</DataTable.Title>
            </DataTable.Header>
        )
    }

    return (
        <View style={styles.container}>
            <PaperProvider theme={{ ...MD3DarkTheme }}>
                <Pressable android_ripple={{ foreground: true, color: "rgba(255,255,255,0.15)" }} className="bg-[#8a85ff] border rounded-md p-2 m-2" title='New' color="#61dafb">
                    <Text className="text-[#fff] text-center">New +</Text>
                </Pressable>
                <ScrollView horizontal>
                    <View>
                        <FlatList
                            style={{ alignSelf: "flex-start" }}
                            renderItem={TableRow}
                            ListHeaderComponent={TableHeader}
                            data={tableData}
                            stickyHeaderIndices={[0]}
                        />
                        <DataTable.Pagination
                            style={{ width: "100%", justifyContent: "flex-start", marginBottom: 100 }}
                            page={pageNumber}
                            numberOfPages={tableData?.total ?? 0}
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

export default WorkOrder;