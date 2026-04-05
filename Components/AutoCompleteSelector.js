import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { ActivityIndicator, Icon, Modal, Portal, Provider, TextInput } from 'react-native-paper';
/*usage
<AutoCompleteSelector
    ButtonStyle={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", borderRadius: 5, gap: 10, width: "100%" }}
    ModalTitle="Select an option"
    isDisabled={false}
    isLoading={false}
    Data={data}
    Label={"Options"}
    onSelected={(selectedItem) => setCurrentOption(selectedItem)}
/>
for keyboard avoiding view, wrap the parent with PaperProvider component then with <KeyboardAvoidingView keyboardVerticalOffset={useHeaderHeight()} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}></KeyboardAvoidingView>

data example
    const [currentOption, setCurrentOption] = useState({ textField: "Option 2", valueField: 2 });
    const data = [
        { id: 1, name: "Option 1" },
        { id: 2, name: "Option 2" },
        { id: 3, name: "Option 3" },
        { id: 4, name: "Option 4" },
        { id: 5, name: "Option 5" },
    ]
*/
/**
 * @typedef {Object} AutoCompleteSelectorProps
 * @property {import('react-native').StyleProp<import('react-native').ViewStyle>} [ButtonStyle]
 * @property {string} ModalTitle
 * @property {boolean} [isDisabled]
 * @property {boolean} [isLoading]
 * @property {Array<{id: number, name: string}>} Data
 * @property {string} Label
 * @property {number} [ValueId]
 * @property {(selectedItem: {id: number, name: string}) => void} [onSelected]
 * @param {AutoCompleteSelectorProps} props
 */
const AutoCompleteSelector = ({ Label, ValueId, Data, isLoading = false, isDisabled = false, ButtonStyle, ModalTitle = 'Title Goes Here', onSelected }) => {
    const safeData = useMemo(() => Data ?? [], [Data]);
    const defaultSelected = { id: null, name: "-- None --" }
    const [selectedItem, setSelectedItem] = useState(ValueId ? safeData?.find(item => item.id === ValueId) : defaultSelected);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [filteredData, setFilteredData] = useState(() => [defaultSelected, ...safeData]);
    useEffect(() => {
        setFilteredData([defaultSelected, ...(safeData ?? [])]);
    }, [safeData]);
    const handleSearch = (textValue) => {
        const filtered = safeData?.filter(item => item.id != null && item.name.toLowerCase().includes(textValue.toLowerCase()));
        console.log("filtered", filtered);
        setFilteredData([defaultSelected, ...filtered]);
    };
    return (
        <>
            <Pressable onPress={() => setIsModalVisible(true)} style={{ ...ButtonStyle, borderColor: isDisabled ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.5)", flexDirection: "row", alignItems: "center", padding: 10 }} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.1)" }} disabled={isDisabled || isLoading}>
                <Text style={{ padding: 3, position: "absolute", top: -13, left: 13, color: isDisabled ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.5)", backgroundColor: "#1c2025" }}>{Label}</Text>
                <Text style={{ color: isDisabled ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,1)", fontSize: 15 }}>{selectedItem?.name}</Text>
                <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
                    <ActivityIndicator animating={isLoading} size="small" />
                    <Icon source="chevron-down" size={20} color={isDisabled ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.5)"} />
                </View>
            </Pressable>
            <Portal>
                <Modal onDismiss={() => setIsModalVisible(false)} visible={isModalVisible}>
                    <View style={{ backgroundColor: '#282C34', justifyContent: "center", alignItems: "center", borderRadius: 5, marginHorizontal: 40, padding: 20 }}>
                        <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
                            <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>{ModalTitle}</Text>
                            <Pressable style={{ padding: 5, borderRadius: 5 }} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.1)" }} onPress={() => setIsModalVisible(false)}>
                                <Icon source="close" size={25} color="rgba(255,255,255,0.5)" onPress={() => setIsModalVisible(false)} />
                            </Pressable>
                        </View>
                        <TextInput onChangeText={(textValue) => handleSearch(textValue)} left={<TextInput.Icon color="rgba(255,255,255,0.5)" icon="magnify" />} placeholderTextColor={"rgba(255,255,255,0.5)"} mode='outlined' placeholder='search' style={{ height: 40, backgroundColor: "transparent", width: "100%" }} />
                        <FlatList
                            style={{ marginTop: 20, width: "100%", maxHeight: 200 }}
                            data={filteredData}
                            keyExtractor={(item) => item.id?.toString() ?? `null-${item.name}`}
                            ItemSeparatorComponent={() => <View style={{ height: 0.5, backgroundColor: "rgba(255,255,255,0.1)", width: "100%" }} />}
                            renderItem={({ item }) => (
                                <Pressable style={{ padding: 10, justifyContent: "center", alignItems: "flex-start" }} android_ripple={{ foreground: true, color: "rgba(255,255,255,0.1)" }} onPress={() => {
                                    setSelectedItem(item);
                                    onSelected && onSelected(item);
                                    setIsModalVisible(false);
                                    handleSearch("");
                                }}>
                                    <Text style={{ color: "white", fontSize: 15, justifyContent: "center", alignItems: "flex-start" }}>{item.name}</Text>
                                </Pressable>
                            )}
                        />
                    </View>
                </Modal>
            </Portal >
        </>
    );
};
export default AutoCompleteSelector;