/**
 * Suggestions screen component
 * Displays all smart suggestions in a vertically-scrollable list
 */
import React from "react";
import { ScrollContainer, Container, Title, SectionTitle, Card, Row, SpaceBetween, BodyText, SecondaryText } from "../components/StyledComponents";
import { useSuggestions } from "../../controller/useSuggestions";
import { useSessionTypes } from "../../controller/useSessionTypes";
import { useSessions } from "../../controller/useSessions";
import { format, parseISO, isToday, isTomorrow, differenceInDays } from "date-fns";
import { View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { SessionSuggestion } from "../../model/types";
import { theme } from "../../styles/theme";

/**
 * Suggestions screen component
 */
export const SuggestionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { sessionTypes } = useSessionTypes();
  const { suggestions, fetchAllSuggestions, loading } = useSuggestions();
  const { createSession } = useSessions();

  // Fetch suggestions when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (sessionTypes.length > 0) {
        const sessionTypeIds = sessionTypes.map(st => st.id);
        fetchAllSuggestions(sessionTypeIds, 60, 7);
      }
    }, [sessionTypes, fetchAllSuggestions])
  );

  const handleAcceptSuggestion = async (suggestion: SessionSuggestion) => {
    try {
      await createSession({
        sessionTypeId: suggestion.sessionTypeId,
        startTime: suggestion.startTime,
        endTime: suggestion.endTime,
      });
      
      Alert.alert("Success", "Session created successfully!");
      
      // Refresh suggestions after accepting
      if (sessionTypes.length > 0) {
        const sessionTypeIds = sessionTypes.map(st => st.id);
        await fetchAllSuggestions(sessionTypeIds, 60, 7);
      }
    } catch (error: any) {
      console.error("Failed to accept suggestion:", error);
      if (error?.response?.status === 409 || error?.message?.includes("conflict")) {
        Alert.alert("Conflict", "This session conflicts with an existing session. Please choose a different suggestion.");
      } else {
        Alert.alert("Error", "Failed to create session from suggestion. Please try again.");
      }
    }
  };

  const formatDateLabel = (startTime: string): string => {
    const date = parseISO(startTime);
    if (isToday(date)) {
      return "Today";
    } else if (isTomorrow(date)) {
      return "Tomorrow";
    } else {
      const daysDiff = differenceInDays(date, new Date());
      if (daysDiff <= 7) {
        return format(date, "EEEE");
      } else {
        return format(date, "MMM d");
      }
    }
  };

  const formatTimeRange = (startTime: string, endTime: string): string => {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    return `${format(start, "h:mm")}-${format(end, "h:mm a")}`;
  };

  if (loading && suggestions.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={['top']}>
        <Container style={{ justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={['top']}>
      <Container>
        <ScrollContainer
          contentContainerStyle={{
            flexGrow: 1,
            paddingLeft: theme.screenPadding.horizontal,
            paddingRight: theme.screenPadding.horizontal,
            paddingTop: theme.screenPadding.top,
            paddingBottom: theme.screenPadding.bottom,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <SpaceBetween style={{ marginBottom: 12 }}>
              <Title style={{ marginBottom: 0 }}>Smart Suggestions</Title>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="Go back"
                accessibilityRole="button"
                onPress={() => navigation.goBack()}
                style={{
                  width: 44,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BodyText style={{ fontSize: 24 }}>×</BodyText>
              </TouchableOpacity>
            </SpaceBetween>
            <SecondaryText style={{ fontSize: 14 }}>
              {suggestions.length > 0 
                ? `${suggestions.length} suggestions available`
                : "No suggestions available. Create session types and availability windows to get suggestions."}
            </SecondaryText>
          </View>

          {/* Suggestions List */}
          {suggestions.length === 0 ? (
            <Card style={{ backgroundColor: "#FFFFFF", padding: 24, alignItems: "center" }}>
              <SecondaryText style={{ fontSize: 16, textAlign: "center" }}>
                No suggestions available. Make sure you have:
              </SecondaryText>
              <View style={{ marginTop: 16, width: "100%" }}>
                <SecondaryText style={{ fontSize: 14, marginBottom: 8 }}>
                  • At least one session type created
                </SecondaryText>
                <SecondaryText style={{ fontSize: 14, marginBottom: 8 }}>
                  • Availability windows set up
                </SecondaryText>
                <SecondaryText style={{ fontSize: 14 }}>
                  • Some existing sessions scheduled
                </SecondaryText>
              </View>
            </Card>
          ) : (
            <View>
              {suggestions.map((suggestion, index) => {
                const sessionType = sessionTypes.find((st) => st.id === suggestion.sessionTypeId);
                if (!sessionType) return null;

                const dateLabel = formatDateLabel(suggestion.startTime);
                const timeRange = formatTimeRange(suggestion.startTime, suggestion.endTime);

                return (
                  <Card
                    key={`${suggestion.sessionTypeId}-${index}`}
                    style={{
                      backgroundColor: "#DDD6FE",
                      padding: 16,
                      marginBottom: 16,
                    }}
                  >
                    <View style={{ marginBottom: 12 }}>
                      <SectionTitle style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
                        {sessionType.name}
                      </SectionTitle>
                      <SecondaryText style={{ marginBottom: 12, fontSize: 14 }}>
                        🕐 {dateLabel} · {timeRange}
                      </SecondaryText>
                      <SecondaryText style={{ marginBottom: 16, fontSize: 14, lineHeight: 20 }}>
                        {suggestion.reason}
                      </SecondaryText>
                    </View>
                    <Row>
                      <TouchableOpacity
                        accessible={true}
                        accessibilityLabel={`Accept ${sessionType.name} suggestion for ${dateLabel} at ${timeRange}`}
                        accessibilityHint="Creates a session with the suggested time"
                        accessibilityRole="button"
                        style={{
                          backgroundColor: "#1E293B",
                          paddingHorizontal: 20,
                          paddingVertical: 12,
                          borderRadius: 8,
                          marginRight: 8,
                          flex: 1,
                          minHeight: 44,
                          justifyContent: "center",
                        }}
                        onPress={() => handleAcceptSuggestion(suggestion)}
                      >
                        <BodyText style={{ color: "#FFFFFF", fontWeight: "600", textAlign: "center" }}>
                          Accept
                        </BodyText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        accessible={true}
                        accessibilityLabel={`Adjust ${sessionType.name} suggestion`}
                        accessibilityHint="Opens the create session form to modify the suggested time"
                        accessibilityRole="button"
                        style={{
                          backgroundColor: "#F1F5F9",
                          paddingHorizontal: 20,
                          paddingVertical: 12,
                          borderRadius: 8,
                          flex: 1,
                          minHeight: 44,
                          justifyContent: "center",
                        }}
                        onPress={() => {
                          navigation.navigate("HomeMain", { 
                            openCreateModal: true,
                            prefillSuggestion: suggestion 
                          });
                        }}
                      >
                        <BodyText style={{ color: "#1E293B", fontWeight: "600", textAlign: "center" }}>
                          Adjust
                        </BodyText>
                      </TouchableOpacity>
                    </Row>
                  </Card>
                );
              })}
            </View>
          )}
        </ScrollContainer>
      </Container>
    </SafeAreaView>
  );
};

