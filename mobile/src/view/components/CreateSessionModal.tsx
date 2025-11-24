/**
 * Modal component for creating a new session
 */
import React, { useState, useEffect } from "react";
import { Modal, View, TextInput, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Card, Row, SpaceBetween, BodyText, SecondaryText, Button, ButtonText } from "./StyledComponents";
import { useSessionTypes } from "../../controller/useSessionTypes";
import { useSessions } from "../../controller/useSessions";
import { format, addHours } from "date-fns";
import { TouchableOpacity } from "react-native";

/**
 * Props for CreateSessionModal component
 */
export type CreateSessionModalProps = {
  visible: boolean;
  onClose: () => void;
  onSessionCreated?: () => void;
  onNavigateToSessionTypes?: () => void;
};

/**
 * Create session modal component
 */
export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  visible,
  onClose,
  onSessionCreated,
  onNavigateToSessionTypes,
}) => {
  const insets = useSafeAreaInsets();
  const { sessionTypes, refetch: refetchSessionTypes } = useSessionTypes();
  const { createSession } = useSessions();
  
  // Initialize with current date/time
  const now = new Date();
  const [selectedSessionTypeId, setSelectedSessionTypeId] = useState<string>("");
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(now);
  const [duration, setDuration] = useState<string>("60");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Picker visibility states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Refetch session types when modal opens
  useEffect(() => {
    if (visible) {
      refetchSessionTypes();
    }
  }, [visible, refetchSessionTypes]);

  // Select first session type by default when available
  useEffect(() => {
    if (sessionTypes.length > 0 && !selectedSessionTypeId) {
      setSelectedSessionTypeId(sessionTypes[0].id);
    }
  }, [sessionTypes, selectedSessionTypeId]);

  // Reset pickers when modal closes
  useEffect(() => {
    if (!visible) {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }
  }, [visible]);

  const handleCreate = async () => {
    if (!selectedSessionTypeId) {
      setError("Please select a session type");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use the selected date/time directly (already in local timezone)
      const durationMinutes = parseInt(duration, 10);
      const startDateTime = selectedDateTime;
      const endDateTime = addHours(startDateTime, durationMinutes / 60);

      // Ensure we're sending UTC ISO strings to the API
      // createSession now automatically refetches, so we wait for it to complete
      await createSession({
        sessionTypeId: selectedSessionTypeId,
        startTime: startDateTime.toISOString(), // Converts local time to UTC ISO
        endTime: endDateTime.toISOString(), // Converts local time to UTC ISO
      });

      // Reset form
      const resetDate = new Date();
      setSelectedSessionTypeId(sessionTypes.length > 0 ? sessionTypes[0].id : "");
      setSelectedDateTime(resetDate);
      setDuration("60");
      
      // Announce success to screen readers
      const sessionType = sessionTypes.find(st => st.id === selectedSessionTypeId);
      AccessibilityInfo.announceForAccessibility(
        `Session created successfully: ${sessionType?.name || "Session"} scheduled for ${format(selectedDateTime, "EEEE, MMMM d")}`
      );
      
      // Call callback after refetch completes (for any additional actions like refreshing progress)
      if (onSessionCreated) {
        await onSessionCreated();
      }
      
      onClose();
    } catch (err: any) {
      // Handle conflict errors specifically
      if (err?.response?.status === 409 || err?.message?.includes("conflict")) {
        setError("This session conflicts with an existing session. Please choose a different time.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to create session");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      accessible={true}
      accessibilityLabel="Create new session"
      accessibilityViewIsModal={true}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        }}
        accessible={false}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />
        <View
          style={{
            width: "100%",
            paddingBottom: insets.bottom,
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          <Card
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 24,
              maxHeight: "90%",
            }}
            accessible={false}
          >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            style={{ flexGrow: 0 }}
          >
            <SpaceBetween style={{ marginBottom: 24 }}>
              <BodyText style={{ fontSize: 20, fontWeight: "700" }}>
                Create Session
              </BodyText>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="Close modal"
                accessibilityRole="button"
                onPress={onClose}
              >
                <BodyText style={{ fontSize: 24 }}>×</BodyText>
              </TouchableOpacity>
            </SpaceBetween>

            {/* Session Type Selection */}
            <View style={{ marginBottom: 20 }}>
              <BodyText style={{ fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
                Session Type
              </BodyText>
              {sessionTypes.length === 0 ? (
                <View>
                  <SecondaryText style={{ marginBottom: 12 }}>
                    No session types available. Please create one first.
                  </SecondaryText>
                  {onNavigateToSessionTypes && (
                    <TouchableOpacity
                      accessible={true}
                      accessibilityLabel="Go to Session Types"
                      accessibilityRole="button"
                      onPress={() => {
                        onClose();
                        onNavigateToSessionTypes();
                      }}
                      style={{
                        backgroundColor: "#1E3A8A",
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderRadius: 12,
                        alignItems: "center",
                      }}
                    >
                      <BodyText style={{ color: "#FFFFFF", fontWeight: "600" }}>
                        Go to Session Types
                      </BodyText>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Row style={{ gap: 12 }}>
                    {sessionTypes.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        accessible={true}
                        accessibilityLabel={`Select ${type.name} session type`}
                        accessibilityRole="button"
                        onPress={() => setSelectedSessionTypeId(type.id)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          borderRadius: 12,
                          backgroundColor:
                            selectedSessionTypeId === type.id
                              ? "#1E3A8A"
                              : "#F1F5F9",
                          borderWidth: 2,
                          borderColor:
                            selectedSessionTypeId === type.id
                              ? "#1E3A8A"
                              : "transparent",
                        }}
                      >
                        <BodyText
                          style={{
                            color:
                              selectedSessionTypeId === type.id
                                ? "#FFFFFF"
                                : "#1E293B",
                            fontWeight:
                              selectedSessionTypeId === type.id ? "600" : "400",
                          }}
                        >
                          {type.name}
                        </BodyText>
                      </TouchableOpacity>
                    ))}
                  </Row>
                </ScrollView>
              )}
            </View>

            {/* Date Selection */}
            <View style={{ marginBottom: 20 }}>
              <BodyText style={{ fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
                Date
              </BodyText>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel={`Selected date: ${format(selectedDateTime, "EEEE, MMMM d, yyyy")}`}
                accessibilityHint="Double tap to change the date for this session"
                accessibilityRole="button"
                onPress={() => setShowDatePicker(true)}
                style={{
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 12,
                  padding: 12,
                  minHeight: 44,
                  backgroundColor: "#FFFFFF",
                }}
              >
                <BodyText style={{ fontSize: 16 }}>
                  {format(selectedDateTime, "EEEE, MMMM d, yyyy")}
                </BodyText>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDateTime}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, date) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (date) {
                      // Preserve the time when changing date
                      const newDate = new Date(selectedDateTime);
                      newDate.setFullYear(date.getFullYear());
                      newDate.setMonth(date.getMonth());
                      newDate.setDate(date.getDate());
                      setSelectedDateTime(newDate);
                    }
                  }}
                />
              )}
            </View>

            {/* Time Selection */}
            <View style={{ marginBottom: 20 }}>
              <BodyText style={{ fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
                Start Time
              </BodyText>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel={`Selected start time: ${format(selectedDateTime, "h:mm a")}`}
                accessibilityHint="Double tap to change the start time for this session"
                accessibilityRole="button"
                onPress={() => setShowTimePicker(true)}
                style={{
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 12,
                  padding: 12,
                  minHeight: 44,
                  backgroundColor: "#FFFFFF",
                }}
              >
                <BodyText style={{ fontSize: 16 }}>
                  {format(selectedDateTime, "h:mm a")}
                </BodyText>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={selectedDateTime}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  is24Hour={false}
                  onChange={(event, date) => {
                    setShowTimePicker(Platform.OS === "ios");
                    if (date) {
                      // Preserve the date when changing time
                      const newDate = new Date(selectedDateTime);
                      newDate.setHours(date.getHours());
                      newDate.setMinutes(date.getMinutes());
                      setSelectedDateTime(newDate);
                    }
                  }}
                />
              )}
            </View>

            {/* Duration Selection */}
            <View style={{ marginBottom: 24 }}>
              <BodyText style={{ fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
                Duration (minutes)
              </BodyText>
              <TextInput
                accessible={true}
                accessibilityLabel="Session duration in minutes"
                accessibilityHint="Enter the duration of the session in minutes. Default is 60 minutes."
                style={{
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: "#FFFFFF",
                  minHeight: 44,
                }}
                value={duration}
                onChangeText={setDuration}
                placeholder="60"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>

            {error && (
              <Card style={{ backgroundColor: "#FEE2E2", marginBottom: 16, padding: 12 }}>
                <BodyText style={{ color: "#DC2626", fontSize: 14 }}>{error}</BodyText>
              </Card>
            )}

            {/* Action Buttons */}
            <Row style={{ gap: 12 }}>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="Cancel creating session"
                accessibilityRole="button"
                onPress={onClose}
                style={{
                  flex: 1,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BodyText style={{ fontWeight: "600" }}>Cancel</BodyText>
              </TouchableOpacity>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="Create session"
                accessibilityRole="button"
                onPress={handleCreate}
                disabled={loading || !selectedSessionTypeId}
                style={{
                  flex: 1,
                  backgroundColor: loading || !selectedSessionTypeId ? "#94A3B8" : "#1E3A8A",
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: loading || !selectedSessionTypeId ? 0.5 : 1,
                }}
              >
                <BodyText style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  {loading ? "Creating..." : "Create"}
                </BodyText>
              </TouchableOpacity>
            </Row>
          </ScrollView>
        </Card>
        </View>
      </View>
    </Modal>
  );
};

