/**
 * Availability management screen
 */
import React, { useState } from "react";
import { ScrollView, View, TextInput, Modal, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollContainer, Container, Title, SectionTitle, Card, Row, SpaceBetween, BodyText, SecondaryText } from "../components/StyledComponents";
import { useAvailability } from "../../controller/useAvailability";
import { AvailabilityWindow, CreateAvailabilityWindowRequest } from "../../model/types";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

/**
 * Availability screen component
 */
export const AvailabilityScreen: React.FC = () => {
  const { windows, createWindow, deleteWindow, loading } = useAvailability();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateAvailabilityWindowRequest>({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
  });

  const handleOpenModal = () => {
    setFormData({
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "17:00",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "17:00",
    });
  };

  const handleSave = async () => {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.startTime) || !timeRegex.test(formData.endTime)) {
      Alert.alert("Error", "Time must be in HH:mm format (e.g., 09:00)");
      return;
    }

    if (formData.startTime >= formData.endTime) {
      Alert.alert("Error", "Start time must be before end time");
      return;
    }

    try {
      await createWindow(formData);
      handleCloseModal();
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to create availability window");
    }
  };

  const handleDelete = (window: AvailabilityWindow) => {
    Alert.alert(
      "Delete Availability Window",
      `Delete ${DAYS_OF_WEEK[window.dayOfWeek].label} ${window.startTime}-${window.endTime}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWindow(window.id);
            } catch (error) {
              Alert.alert("Error", error instanceof Error ? error.message : "Failed to delete availability window");
            }
          },
        },
      ]
    );
  };

  const windowsByDay = windows.reduce((acc, window) => {
    if (!acc[window.dayOfWeek]) {
      acc[window.dayOfWeek] = [];
    }
    acc[window.dayOfWeek].push(window);
    return acc;
  }, {} as Record<number, AvailabilityWindow[]>);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={['top']}>
      <Container>
        <ScrollContainer
          contentContainerStyle={{
            flexGrow: 1,
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 20,
            paddingBottom: 48,
          }}
          showsVerticalScrollIndicator={false}
        >
          <SpaceBetween style={{ marginBottom: 24 }}>
            <Title>Availability</Title>
            <TouchableOpacity
              accessible={true}
              accessibilityLabel="Add new availability window"
              accessibilityRole="button"
              onPress={handleOpenModal}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#1E293B",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BodyText style={{ color: "#FFFFFF", fontSize: 24, lineHeight: 24 }}>+</BodyText>
            </TouchableOpacity>
          </SpaceBetween>

          {windows.length === 0 ? (
            <Card>
              <SecondaryText style={{ textAlign: "center", marginBottom: 16 }}>
                No availability windows set. Add your weekly availability to get smart suggestions!
              </SecondaryText>
            </Card>
          ) : (
            DAYS_OF_WEEK.map((day) => {
              const dayWindows = windowsByDay[day.value] || [];
              return (
                <View key={day.value} style={{ marginBottom: 20 }}>
                  <SectionTitle style={{ fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
                    {day.label}
                  </SectionTitle>
                  {dayWindows.length === 0 ? (
                    <Card>
                      <SecondaryText>No availability set</SecondaryText>
                    </Card>
                  ) : (
                    dayWindows.map((window) => (
                      <Card key={window.id} style={{ marginBottom: 8 }}>
                        <SpaceBetween>
                          <BodyText style={{ fontSize: 16, fontWeight: "600" }}>
                            {window.startTime} - {window.endTime}
                          </BodyText>
                          <TouchableOpacity
                            accessible={true}
                            accessibilityLabel={`Delete availability window ${window.startTime}-${window.endTime}`}
                            accessibilityRole="button"
                            onPress={() => handleDelete(window)}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              backgroundColor: "#FEE2E2",
                              borderRadius: 8,
                            }}
                          >
                            <BodyText style={{ fontSize: 14, fontWeight: "600", color: "#DC2626" }}>
                              Delete
                            </BodyText>
                          </TouchableOpacity>
                        </SpaceBetween>
                      </Card>
                    ))
                  )}
                </View>
              );
            })
          )}
        </ScrollContainer>
      </Container>

      {/* Create Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={handleCloseModal}
          />
          <Card
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
            }}
          >
            <SpaceBetween style={{ marginBottom: 24 }}>
              <Title style={{ fontSize: 20 }}>Add Availability Window</Title>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="Close modal"
                accessibilityRole="button"
                onPress={handleCloseModal}
              >
                <BodyText style={{ fontSize: 24 }}>×</BodyText>
              </TouchableOpacity>
            </SpaceBetween>

            <View style={{ marginBottom: 20 }}>
              <BodyText style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
                Day of Week
              </BodyText>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {DAYS_OF_WEEK.map((day) => (
                  <TouchableOpacity
                    key={day.value}
                    accessible={true}
                    accessibilityLabel={`Select ${day.label}`}
                    accessibilityRole="button"
                    onPress={() => setFormData({ ...formData, dayOfWeek: day.value })}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: formData.dayOfWeek === day.value ? "#1E3A8A" : "#F1F5F9",
                    }}
                  >
                    <BodyText
                      style={{
                        color: formData.dayOfWeek === day.value ? "#FFFFFF" : "#1E293B",
                        fontWeight: formData.dayOfWeek === day.value ? "600" : "400",
                        fontSize: 14,
                      }}
                    >
                      {day.label.slice(0, 3)}
                    </BodyText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <BodyText style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
                Start Time (HH:mm)
              </BodyText>
              <TextInput
                accessible={true}
                accessibilityLabel="Availability start time"
                accessibilityHint="Enter the start time in 24-hour format, for example 09:00 for 9 AM"
                style={{
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: "#FFFFFF",
                  minHeight: 44,
                }}
                value={formData.startTime}
                onChangeText={(text) => setFormData({ ...formData, startTime: text })}
                placeholder="09:00"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <BodyText style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
                End Time (HH:mm)
              </BodyText>
              <TextInput
                accessible={true}
                accessibilityLabel="Availability end time"
                accessibilityHint="Enter the end time in 24-hour format, for example 17:00 for 5 PM. Must be after start time."
                style={{
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: "#FFFFFF",
                  minHeight: 44,
                }}
                value={formData.endTime}
                onChangeText={(text) => setFormData({ ...formData, endTime: text })}
                placeholder="17:00"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <Row style={{ gap: 12 }}>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="Cancel"
                accessibilityRole="button"
                onPress={handleCloseModal}
                style={{
                  flex: 1,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <BodyText style={{ fontWeight: "600" }}>Cancel</BodyText>
              </TouchableOpacity>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="Add availability window"
                accessibilityRole="button"
                onPress={handleSave}
                style={{
                  flex: 1,
                  backgroundColor: "#1E3A8A",
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <BodyText style={{ color: "#FFFFFF", fontWeight: "600" }}>Add</BodyText>
              </TouchableOpacity>
            </Row>
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

