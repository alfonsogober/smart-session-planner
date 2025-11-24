/**
 * Modal component for editing a session
 */
import React, { useState, useEffect } from "react";
import { Modal, View, TextInput, ScrollView, Platform, Alert, AccessibilityInfo } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, Row, SpaceBetween, BodyText, SecondaryText } from "./StyledComponents";
import { Session } from "../../model/types";
import { format, parseISO } from "date-fns";
import { TouchableOpacity } from "react-native";

/**
 * Props for EditSessionModal component
 */
export type EditSessionModalProps = {
  visible: boolean;
  session: Session | null;
  onClose: () => void;
  onUpdate: (id: string, data: { completed?: boolean; startTime?: string; endTime?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

/**
 * Edit session modal component
 */
export const EditSessionModal: React.FC<EditSessionModalProps> = ({
  visible,
  session,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const insets = useSafeAreaInsets();
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      // Parse UTC ISO strings and format in local timezone for display
      // parseISO correctly parses UTC ISO strings, format displays in local timezone
      const start = parseISO(session.startTime);
      const end = parseISO(session.endTime);
      setStartTime(format(start, "yyyy-MM-dd'T'HH:mm"));
      setEndTime(format(end, "yyyy-MM-dd'T'HH:mm"));
      setError(null);
    }
  }, [session]);

  const handleUpdate = async () => {
    if (!session) return;

    try {
      setLoading(true);
      setError(null);

      // Parse the local time input and convert to UTC ISO
      // Format "yyyy-MM-dd'T'HH:mm" is interpreted as local time by JavaScript Date
      const startDateTime = new Date(startTime);
      const endDateTime = new Date(endTime);

      if (endDateTime <= startDateTime) {
        setError("End time must be after start time");
        return;
      }

      // Convert local time to UTC ISO strings for storage
      await onUpdate(session.id, {
        startTime: startDateTime.toISOString(), // Converts local time to UTC ISO
        endTime: endDateTime.toISOString(), // Converts local time to UTC ISO
      });

      // Announce success to screen readers
      AccessibilityInfo.announceForAccessibility(
        `Session updated successfully: ${session.sessionType.name}`
      );

      onClose();
    } catch (err: any) {
      if (err?.response?.status === 409 || err?.message?.includes("conflict")) {
        setError("This time conflicts with an existing session. Please choose a different time.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to update session");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!session) return;

    Alert.alert(
      "Delete Session",
      `Are you sure you want to delete this ${session.sessionType.name} session?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await onDelete(session.id);
              onClose();
            } catch (error) {
              Alert.alert("Error", "Failed to delete session");
            }
          },
        },
      ]
    );
  };

  const handleToggleComplete = async () => {
    if (!session) return;

    try {
      await onUpdate(session.id, { completed: !session.completed });
      
      // Announce state change to screen readers
      const announcement = !session.completed
        ? `${session.sessionType.name} session marked as completed`
        : `${session.sessionType.name} session marked as incomplete`;
      AccessibilityInfo.announceForAccessibility(announcement);
      
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to update session");
    }
  };

  if (!session) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      accessible={true}
      accessibilityLabel={`Edit ${session.sessionType.name} session`}
      accessibilityViewIsModal={true}
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
                Edit Session
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

            <View style={{ marginBottom: 20 }}>
              <BodyText style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
                Session Type
              </BodyText>
              <BodyText style={{ fontSize: 16 }}>{session.sessionType.name}</BodyText>
            </View>

            {error && (
              <Card style={{ backgroundColor: "#FEE2E2", marginBottom: 16, padding: 12 }}>
                <BodyText style={{ color: "#DC2626", fontSize: 14 }}>{error}</BodyText>
              </Card>
            )}

            <View style={{ marginBottom: 20 }}>
              <BodyText style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
                Start Time
              </BodyText>
              <TextInput
                accessible={true}
                accessibilityLabel="Session start time"
                accessibilityHint="Enter the start time in format YYYY-MM-DDTHH:mm. For example, 2024-01-15T10:00"
                style={{
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: "#FFFFFF",
                  minHeight: 44,
                }}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="2024-01-15T10:00"
                placeholderTextColor="#94A3B8"
                {...(Platform.OS === "ios" ? {} : { type: "datetime-local" })}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <BodyText style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
                End Time
              </BodyText>
              <TextInput
                accessible={true}
                accessibilityLabel="Session end time"
                accessibilityHint="Enter the end time in format YYYY-MM-DDTHH:mm. Must be after start time."
                style={{
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: "#FFFFFF",
                  minHeight: 44,
                }}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="2024-01-15T11:00"
                placeholderTextColor="#94A3B8"
                {...(Platform.OS === "ios" ? {} : { type: "datetime-local" })}
              />
            </View>

            <Row style={{ gap: 12, marginBottom: 12 }}>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel={session.completed ? "Mark as incomplete" : "Mark as complete"}
                accessibilityHint={session.completed ? "Removes the completed status from this session" : "Marks this session as completed"}
                accessibilityRole="button"
                onPress={handleToggleComplete}
                style={{
                  flex: 1,
                  backgroundColor: session.completed ? "#FEE2E2" : "#D1FAE5",
                  borderRadius: 12,
                  padding: 12,
                  minHeight: 44,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BodyText style={{ fontWeight: "600", color: session.completed ? "#DC2626" : "#059669" }}>
                  {session.completed ? "Mark Incomplete" : "Mark Complete"}
                </BodyText>
              </TouchableOpacity>
            </Row>

            <Row style={{ gap: 12, marginBottom: 12 }}>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="Save changes"
                accessibilityHint="Saves the updated session details"
                accessibilityRole="button"
                accessibilityState={{ disabled: loading }}
                onPress={handleUpdate}
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: loading ? "#94A3B8" : "#1E3A8A",
                  borderRadius: 12,
                  padding: 12,
                  minHeight: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                <BodyText style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  {loading ? "Saving..." : "Save"}
                </BodyText>
              </TouchableOpacity>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="Delete session"
                accessibilityHint="Permanently deletes this session"
                accessibilityRole="button"
                onPress={handleDelete}
                style={{
                  flex: 1,
                  backgroundColor: "#FEE2E2",
                  borderRadius: 12,
                  padding: 12,
                  minHeight: 44,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BodyText style={{ color: "#DC2626", fontWeight: "600" }}>Delete</BodyText>
              </TouchableOpacity>
            </Row>

            <TouchableOpacity
              accessible={true}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
              onPress={onClose}
              style={{
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
          </ScrollView>
        </Card>
        </View>
      </View>
    </Modal>
  );
};

