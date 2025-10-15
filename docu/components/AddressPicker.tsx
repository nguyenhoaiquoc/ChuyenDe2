import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

const { width } = Dimensions.get("window");

export default function AddressPicker({ onChange }: { onChange: (fullAddress: string) => void }) {
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);

    const [selectedProvince, setSelectedProvince] = useState<any>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
    const [selectedWard, setSelectedWard] = useState<any>(null);
    const [village, setVillage] = useState("");

    const [showProvinceModal, setShowProvinceModal] = useState(false);
    const [showDistrictModal, setShowDistrictModal] = useState(false);
    const [showWardModal, setShowWardModal] = useState(false);

    useEffect(() => {
        axios.get("https://provinces.open-api.vn/api/?depth=1")
            .then(res => setProvinces(res.data))
            .catch(err => console.log("Lỗi lấy tỉnh:", err));
    }, []);

    const handleSelectProvince = async (province: any) => {
        setSelectedProvince(province);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setWards([]);
        setShowProvinceModal(false);

        try {
            const res = await axios.get(`https://provinces.open-api.vn/api/p/${province.code}?depth=3`);
            setDistricts(res.data.districts);

            // Gộp tất cả xã từ các huyện
            const allWards = res.data.districts.flatMap((d: any) => d.wards);
            setWards(allWards);
        } catch (err) {
            console.log("Lỗi lấy huyện:", err);
        }
    };

    const handleSelectDistrict = (district: any) => {
        setSelectedDistrict(district);
        setSelectedWard(null);
        setShowDistrictModal(false);

        if (Array.isArray(district.wards)) {
            if (district.wards.length > 0) {
                setWards(district.wards);
            } else {
                console.log("Huyện này có mảng xã rỗng.");
                setWards([]);
            }
        } else {
            console.log("Huyện này không có trường 'wards'.");
            setWards([]);
        }
    };

    const handleSelectWard = (ward: any) => {
        setSelectedWard(ward);
        setShowWardModal(false);
    };

    useEffect(() => {
        if (selectedProvince && selectedDistrict && selectedWard && village) {
            const fullAddress = `${village}, ${selectedWard.name}, ${selectedDistrict.name}, ${selectedProvince.name}`;
            onChange(fullAddress);
        }
    }, [selectedProvince, selectedDistrict, selectedWard, village]);

    return (
        <View style={styles.container}>
            {/* Chọn tỉnh */}
            <TouchableOpacity
                style={[styles.dropdown, !selectedProvince && styles.dropdownDisabled]}
                onPress={() => setShowProvinceModal(true)}
                disabled={!selectedProvince && false}
            >
                <View style={styles.dropdownContent}>
                    <Text style={styles.dropdownText}>{selectedProvince?.name || "Chọn tỉnh/thành phố"}</Text>
                    <Ionicons name="chevron-down" size={20} color="#8c7ae6" />
                </View>
            </TouchableOpacity>

            {/* Chọn huyện */}
            <TouchableOpacity
                style={[styles.dropdown, !selectedProvince && styles.dropdownDisabled]}
                onPress={() => setShowDistrictModal(true)}
                disabled={!selectedProvince}
            >
                <View style={styles.dropdownContent}>
                    <Text style={styles.dropdownText}>{selectedDistrict?.name || "Chọn quận/huyện"}</Text>
                    <Ionicons name="chevron-down" size={20} color="#8c7ae6" />
                </View>
            </TouchableOpacity>

            {/* Chọn xã */}
            <TouchableOpacity
                style={[styles.dropdown, !selectedDistrict && styles.dropdownDisabled]}
                onPress={() => setShowWardModal(true)}
                disabled={!selectedDistrict}
            >
                <View style={styles.dropdownContent}>
                    <Text style={styles.dropdownText}>{selectedWard?.name || "Chọn xã/phường"}</Text>
                    <Ionicons name="chevron-down" size={20} color="#8c7ae6" />
                </View>
            </TouchableOpacity>

            {/* Nhập thôn */}
            <TextInput
                style={styles.input}
                placeholder="Thôn/xóm (tùy chọn)"
                value={village}
                onChangeText={setVillage}
            />

            {/* Modal tỉnh */}
            <Modal visible={showProvinceModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chọn tỉnh/thành phố</Text>
                            <TouchableOpacity onPress={() => setShowProvinceModal(false)}>
                                <Ionicons name="close" size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScroll}>
                            {provinces.map((p) => (
                                <TouchableOpacity
                                    key={p.code}
                                    onPress={() => handleSelectProvince(p)}
                                    style={[
                                        styles.modalItem,
                                        selectedProvince?.code === p.code && styles.modalItemSelected
                                    ]}
                                >
                                    <Text style={styles.modalItemText}>{p.name}</Text>
                                    {selectedProvince?.code === p.code && <Ionicons name="checkmark" size={20} color="#8c7ae6" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Modal huyện */}
            <Modal visible={showDistrictModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chọn quận/huyện</Text>
                            <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                                <Ionicons name="close" size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScroll}>
                            {districts.map((d) => (
                                <TouchableOpacity
                                    key={d.code}
                                    onPress={() => handleSelectDistrict(d)}
                                    style={[
                                        styles.modalItem,
                                        selectedDistrict?.code === d.code && styles.modalItemSelected
                                    ]}
                                >
                                    <Text style={styles.modalItemText}>{d.name}</Text>
                                    {selectedDistrict?.code === d.code && <Ionicons name="checkmark" size={20} color="#8c7ae6" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Modal xã */}
            <Modal visible={showWardModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chọn xã/phường</Text>
                            <TouchableOpacity onPress={() => setShowWardModal(false)}>  
                                <Ionicons name="close" size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScroll}>
                            {wards.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Ionicons name="location" size={48} color="#cbd5e1" />
                                    <Text style={styles.emptyText}>Không có xã/phường nào trong quận/huyện này.</Text>
                                </View>
                            ) : (
                                wards.map((w) => (
                                    <TouchableOpacity
                                        key={w.code}
                                        onPress={() => handleSelectWard(w)}
                                        style={[
                                            styles.modalItem,
                                            selectedWard?.code === w.code && styles.modalItemSelected
                                        ]}
                                    >
                                        <Text style={styles.modalItemText}>{w.name}</Text>
                                        {selectedWard?.code === w.code && <Ionicons name="checkmark" size={20} color="#8c7ae6" />}
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    dropdown: {
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        marginVertical: 4,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    dropdownDisabled: {
        backgroundColor: "#f8fafc",
        opacity: 0.6,
    },
    dropdownContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    dropdownText: {
        fontSize: 16,
        color: "#334155",
        flex: 1,
    },
    input: {
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: "#1e293b",
        backgroundColor: "#fff",
        marginVertical: 4,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderRadius: 20,
        width: width * 0.9,
        maxHeight: "80%",
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1e293b",
    },
    modalScroll: {
        maxHeight: 400,
    },
    modalItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    modalItemSelected: {
        backgroundColor: "#f0f9ff",
    },
    modalItemText: {
        fontSize: 16,
        color: "#334155",
        flex: 1,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: "#94a3b8",
        marginTop: 8,
        textAlign: "center",
    },
});