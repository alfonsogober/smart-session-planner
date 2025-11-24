/**
 * Session Types management screen
 */
import React, { useState } from "react";
import { ScrollView, View, TextInput, Modal, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollContainer, Container, Title, SectionTitle, Card, Row, SpaceBetween, BodyText, SecondaryText } from "../components/StyledComponents";
import { useSessionTypes } from "../../controller/useSessionTypes";
import { SessionType, CreateSessionTypeRequest } from "../../model/types";

/**
 * Session Types screen component
 */
export const SessionTypesScreen: React.FC = () => {
  const { sessionTypes, createSessionType, updateSessionType, deleteSessionType, loading } = useSessionTypes();
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<SessionType | null>(null);
  const [formData, setFormData] = useState<CreateSessionTypeRequest>({
    name: "",
    category: "",
    priority: 3,
  });

  const handleOpenModal = (type?: SessionType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        category: type.category,
        priority: type.priority,
      });
    } else {
      setEditingType(null);
      setFormData({
        name: "",
        category: "",
        priority: 3,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingType(null);
    setFormData({
      name: "",
      category: "",
      priority: 3,
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.category.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (formData.priority < 1 || formData.priority > 5) {
      Alert.alert("Error", "Priority must be between 1 and 5");
      return;
    }

    try {
      if (editingType) {
        await updateSessionType(editingType.id, formData);
      } else {
        await createSessionType(formData);
      }
      handleCloseModal();
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to save session type");
    }
  };

  const handleDelete = (type: SessionType) => {
    Alert.alert(
      "Delete Session Type",
      `Are you sure you want to delete "${type.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSessionType(type.id);
            } catch (error) {
              Alert.alert("Error", error instanceof Error ? error.message : "Failed to delete session type");
            }
          },
        },
      ]
    );
  };

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
            <Title>Session Types</Title>
            <TouchableOpacity
              accessible={true}
              accessibilityLabel="Add new session type"
              accessibilityRole="button"
              onPress={() => handleOpenModal()}
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

          {sessionTypes.length === 0 ? (
            <Card>
              <SecondaryText style={{ textAlign: "center", marginBottom: 16 }}>
                No session types yet. Create one to get started!
              </SecondaryText>
            </Card>
          ) : (
            sessionTypes.map((type) => (
              <Card key={type.id} style={{ marginBottom: 12 }}>
                <SpaceBetween>
                  <View style={{ flex: 1 }}>
                    <BodyText style={{ fontSize: 18, fontWeight: "600", marginBottom: 4 }}>
                      {type.name}
                    </BodyText>
                    <SecondaryText style={{ marginBottom: 4 }}>
                      Category: {type.category}
                    </SecondaryText>
                    <SecondaryText>
                      Priority: {type.priority}/5
                    </SecondaryText>
                  </View>
                  <Row style={{ gap: 8 }}>
                    <TouchableOpacity
                      accessible={true}
                      accessibilityLabel={`Edit ${type.name}`}
                      accessibilityRole="button"
                      onPress={() => handleOpenModal(type)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        backgroundColor: "#E0F2FE",
                        borderRadius: 8,
                      }}
                    >
                      <BodyText style={{ fontSize: 14, fontWeight: "600" }}>Edit</BodyText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      accessible={true}
                      accessibilityLabel={`Delete ${type.name}`}
                      accessibilityRole="button"
                      onPress={() => handleDelete(type)}
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
                  </Row>
                </SpaceBetween>
              </Card>
            ))
          )}
        </ScrollContainer>
      </Container>

      {/* Create/Edit Modal */}
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
              <Title style={{ fontSize: 20 }}>
                {editingType ? "Edit Session Type" : "Create Session Type"}
              </Title>
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
                Name
              </BodyText>
              <TextInput
                accessible={true}
                accessibilityLabel="Session type name"
                accessibilityHint="Enter a name for this session type, such as Deep Work or Morning Meditation"
                style={{
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: "#FFFFFF",
                  minHeight: 44,
                }}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="e.g., Deep Work"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <BodyText style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
                Category
              </BodyText>
              <TextInput
                accessible={true}
                accessibilityLabel="Session type category"
                accessibilityHint="Enter a category for this session type, such as Work, Health, or Learning"
                style={{
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: "#FFFFFF",
                  minHeight: 44,
                }}
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
                placeholder="e.g., Work, Health, Learning"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <BodyText style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
                Priority (1-5)
              </BodyText>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {[1, 2, 3, 4, 5].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    accessible={true}
                    accessibilityLabel={`Set priority to ${priority}`}
                    accessibilityRole="button"
                    onPress={() => setFormData({ ...formData, priority })}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: formData.priority === priority ? "#1E3A8A" : "#F1F5F9",
                      alignItems: "center",
                    }}
                  >
                    <BodyText
                      style={{
                        color: formData.priority === priority ? "#FFFFFF" : "#1E293B",
                        fontWeight: "600",
                      }}
                    >
                      {priority}
                    </BodyText>
                  </TouchableOpacity>
                ))}
              </View>
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
                accessibilityLabel={editingType ? "Save changes" : "Create session type"}
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
                <BodyText style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  {editingType ? "Save" : "Create"}
                </BodyText>
              </TouchableOpacity>
            </Row>
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

