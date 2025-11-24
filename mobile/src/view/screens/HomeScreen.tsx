/**
 * Home/Dashboard screen component
 */
import React, { useState, useEffect, useMemo } from "react";
import { ScrollContainer, Container, Title, SectionTitle, SectionCard, Card, Row, SpaceBetween, BodyText, SecondaryText } from "../components/StyledComponents";
import { SessionCard } from "../components/SessionCard";
import { CreateSessionModal } from "../components/CreateSessionModal";
import { useSessions } from "../../controller/useSessions";
import { useProgress } from "../../controller/useProgress";
import { useSuggestions } from "../../controller/useSuggestions";
import { useSessionTypes } from "../../controller/useSessionTypes";
import { format, startOfWeek, endOfWeek, parseISO, isToday, isTomorrow, differenceInDays } from "date-fns";
import { View, TouchableOpacity, ActivityIndicator, ScrollView, Alert, AccessibilityInfo } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SessionSuggestion } from "../../model/types";
import { theme } from "../../styles/theme";
import { groupSessionsByDay, findConflictingSessions } from "../../model/session";
import { SessionConflictIndicator } from "../components/SessionConflictIndicator";
import { EditSessionModal } from "../components/EditSessionModal";
import { Session } from "../../model/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Home screen component
 */
const VIEW_MODE_STORAGE_KEY = "@home_view_mode";

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [viewMode, setViewMode] = useState<"today" | "week">("today");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const { sessions, todaySessions, weekSessions, updateSession, deleteSession, createSession, refetch } = useSessions();
  const { stats, loading: statsLoading, refetch: refetchProgress } = useProgress();
  const { sessionTypes } = useSessionTypes();
  const { suggestions, fetchAllSuggestions, loading: suggestionsLoading } = useSuggestions();

  // Refresh progress when screen comes into focus (sessions auto-update via store)
  useFocusEffect(
    React.useCallback(() => {
      refetchProgress();
    }, [refetchProgress])
  );

  // Load saved view mode on mount
  useEffect(() => {
    const loadViewMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(VIEW_MODE_STORAGE_KEY);
        if (savedMode === "today" || savedMode === "week") {
          setViewMode(savedMode);
        }
      } catch (error) {
        console.error("Failed to load view mode:", error);
      }
    };
    loadViewMode();
  }, []);

  // Save view mode whenever it changes
  useEffect(() => {
    const saveViewMode = async () => {
      try {
        await AsyncStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
      } catch (error) {
        console.error("Failed to save view mode:", error);
      }
    };
    saveViewMode();
  }, [viewMode]);

  // Get sessions based on view mode - use useMemo to ensure recalculation when sessions change
  const displayedSessions = useMemo(() => {
    const result = viewMode === "today" ? todaySessions : weekSessions;
    // Force recalculation by creating new array reference
    return [...result];
  }, [viewMode, todaySessions, weekSessions]);

  const sessionsByDay = useMemo(() => {
    const result = viewMode === "week" ? groupSessionsByDay(weekSessions) : {};
    // Create new object reference to ensure React detects changes
    return { ...result };
  }, [viewMode, weekSessions]);
  
  // Get week range for display
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
  const weekRange = `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`;

  const handleCompleteSession = async (sessionId: string) => {
    try {
      const session = [...todaySessions, ...weekSessions].find(s => s.id === sessionId);
      const newCompletedState = session ? !session.completed : true;
      await updateSession(sessionId, { completed: newCompletedState });
      await refetch(); // Refresh sessions after update
      await refetchProgress(); // Refresh progress stats
      
      // Announce state change to screen readers
      const sessionTypeName = session?.sessionType.name || "Session";
      const announcement = newCompletedState 
        ? `${sessionTypeName} session marked as completed`
        : `${sessionTypeName} session marked as incomplete`;
      AccessibilityInfo.announceForAccessibility(announcement);
    } catch (error) {
      console.error("Failed to complete session:", error);
      Alert.alert("Error", "Failed to update session. Please try again.");
    }
  };

  const handleEditSession = async (id: string, data: { completed?: boolean; startTime?: string; endTime?: string }) => {
    try {
      await updateSession(id, data);
      await refetch();
      await refetchProgress();
    } catch (error: any) {
      if (error?.response?.status === 409 || error?.message?.includes("conflict")) {
        Alert.alert("Conflict", "This session conflicts with an existing session. Please choose a different time.");
      } else {
        Alert.alert("Error", error instanceof Error ? error.message : "Failed to update session");
      }
      throw error;
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteSession(id);
      await refetch();
      await refetchProgress();
    } catch (error) {
      Alert.alert("Error", "Failed to delete session");
      throw error;
    }
  };

  const handleAcceptSuggestion = async (suggestion: SessionSuggestion) => {
    try {
      // Use the hook's createSession method which handles refetching automatically
      await createSession({
        sessionTypeId: suggestion.sessionTypeId,
        startTime: suggestion.startTime,
        endTime: suggestion.endTime,
      });
      await refetchProgress(); // Refresh progress
      // Refresh suggestions
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

  const handleGetSuggestions = async () => {
    if (sessionTypes.length > 0) {
      const sessionTypeIds = sessionTypes.map(st => st.id);
      await fetchAllSuggestions(sessionTypeIds, 60, 7);
    }
  };

  React.useEffect(() => {
    if (sessionTypes.length > 0) {
      handleGetSuggestions();
    }
  }, [sessionTypes]);

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
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <SpaceBetween style={{ marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Title style={{ marginBottom: 8 }}>Dashboard</Title>
              <SecondaryText style={{ fontSize: 16, marginBottom: 4 }}>
                {viewMode === "today" 
                  ? format(new Date(), "EEEE, MMM d")
                  : weekRange}
              </SecondaryText>
              <SecondaryText style={{ fontSize: 14 }}>
                {viewMode === "today" ? "Your schedule today" : "Your schedule this week"}
              </SecondaryText>
            </View>
            {/* Segmented Control */}
            <View style={{ flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 8, padding: 2 }}>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="Today view"
                accessibilityRole="button"
                onPress={() => setViewMode("today")}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  borderRadius: 6,
                  backgroundColor: viewMode === "today" ? "#FFFFFF" : "transparent",
                }}
              >
                <BodyText style={{ fontSize: 14, fontWeight: viewMode === "today" ? "600" : "400", color: viewMode === "today" ? "#1E293B" : "#64748B" }}>
                  Today
                </BodyText>
              </TouchableOpacity>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="Week view"
                accessibilityRole="button"
                onPress={() => setViewMode("week")}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  borderRadius: 6,
                  backgroundColor: viewMode === "week" ? "#FFFFFF" : "transparent",
                }}
              >
                <BodyText style={{ fontSize: 14, fontWeight: viewMode === "week" ? "600" : "400", color: viewMode === "week" ? "#1E293B" : "#64748B" }}>
                  Week
                </BodyText>
              </TouchableOpacity>
            </View>
          </SpaceBetween>
        </View>

        {/* Schedule Summary */}
        <Card style={{ marginBottom: 24 }}>
          <Row>
            <SecondaryText style={{ fontSize: 14 }}>🕐 {displayedSessions.length} sessions</SecondaryText>
            <SecondaryText style={{ marginLeft: 8, marginRight: 8 }}>·</SecondaryText>
            <SecondaryText style={{ fontSize: 14 }}>
              ✓ {displayedSessions.filter((s) => s.completed).length} done
            </SecondaryText>
          </Row>
        </Card>

        {/* Smart Suggestions - Horizontal Scroll */}
        {suggestions.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <SpaceBetween style={{ marginBottom: 16 }}>
              <SectionTitle style={{ fontSize: 18, fontWeight: "600" }}>Smart Suggestions</SectionTitle>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="View all suggestions"
                accessibilityHint="Opens a page showing all available suggestions"
                accessibilityRole="button"
                onPress={() => navigation.navigate("Suggestions")}
                style={{
                  minWidth: 44,
                  minHeight: 44,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BodyText style={{ fontSize: 18 }}>→</BodyText>
              </TouchableOpacity>
            </SpaceBetween>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {suggestions.slice(0, 5).map((suggestion, index) => {
                const sessionType = sessionTypes.find((st) => st.id === suggestion.sessionTypeId);
                if (!sessionType) return null;

                const startTime = parseISO(suggestion.startTime);
                const endTime = parseISO(suggestion.endTime);
                
                // Format date label
                let dateLabel = "";
                if (isToday(startTime)) {
                  dateLabel = "Today";
                } else if (isTomorrow(startTime)) {
                  dateLabel = "Tomorrow";
                } else {
                  const daysDiff = differenceInDays(startTime, new Date());
                  if (daysDiff <= 7) {
                    dateLabel = format(startTime, "EEEE");
                  } else {
                    dateLabel = format(startTime, "MMM d");
                  }
                }
                
                // Format time range
                const timeRange = `${format(startTime, "h:mm")}-${format(endTime, "h:mm a")}`;

                return (
                  <Card 
                    key={`${suggestion.sessionTypeId}-${index}`} 
                    style={{ 
                      width: 280,
                      marginRight: 12,
                      backgroundColor: "#DDD6FE",
                      padding: 16,
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
                          paddingVertical: 10,
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
                          paddingVertical: 10,
                          borderRadius: 8,
                          flex: 1,
                          minHeight: 44,
                          justifyContent: "center",
                        }}
                        onPress={() => {
                          // Open create modal with pre-filled data
                          setShowCreateModal(true);
                          // TODO: Pre-fill the modal with suggestion data
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
            </ScrollView>
          </View>
        )}

        {/* Sessions Section */}
        <View style={{ marginBottom: 24 }}>
          <SpaceBetween style={{ marginBottom: 16 }}>
            <SectionTitle style={{ fontSize: 18, fontWeight: "600" }}>
              {viewMode === "today" ? "Today's Sessions" : "This Week's Sessions"}
            </SectionTitle>
            <TouchableOpacity
              accessible={true}
              accessibilityLabel="Add new session"
              accessibilityHint="Opens a form to create a new session"
              accessibilityRole="button"
              onPress={() => setShowCreateModal(true)}
              style={{
                minWidth: 44,
                minHeight: 44,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#1E293B",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BodyText style={{ color: "#FFFFFF", fontSize: 24, lineHeight: 24 }}>+</BodyText>
            </TouchableOpacity>
          </SpaceBetween>

          {viewMode === "today" ? (
            // Today view
            displayedSessions.length === 0 ? (
              <Card>
                <SecondaryText>No sessions scheduled for today</SecondaryText>
              </Card>
            ) : (
              displayedSessions.map((session) => {
                const conflicts = findConflictingSessions(session, sessions);
                return (
                  <View key={session.id}>
                    <SessionCard
                      session={session}
                      onPress={() => setEditingSession(session)}
                      onComplete={() => handleCompleteSession(session.id)}
                    />
                    {conflicts.length > 0 && <SessionConflictIndicator conflicts={conflicts} />}
                  </View>
                );
              })
            )
          ) : (
            // Week view - grouped by day
            Object.keys(sessionsByDay).length === 0 ? (
              <Card>
                <SecondaryText>No sessions scheduled for this week</SecondaryText>
              </Card>
            ) : (
              Object.entries(sessionsByDay).map(([day, daySessions]) => (
                <View key={day} style={{ marginBottom: 20 }}>
                  <SectionTitle style={{ fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
                    {day}
                  </SectionTitle>
                  {daySessions.map((session) => {
                    const conflicts = findConflictingSessions(session, sessions);
                    return (
                      <View key={session.id}>
                        <SessionCard
                          session={session}
                          onPress={() => setEditingSession(session)}
                          onComplete={() => handleCompleteSession(session.id)}
                        />
                        {conflicts.length > 0 && <SessionConflictIndicator conflicts={conflicts} />}
                      </View>
                    );
                  })}
                </View>
              ))
            )
          )}
        </View>

        {/* Progress Section - Always visible */}
        <SectionCard style={{ marginTop: 24, backgroundColor: "#E0F2FE" }}>
          <Row style={{ marginBottom: 20, alignItems: "center" }}>
            {/* Target icon - concentric circles */}
            <View style={{ width: 24, height: 24, marginRight: 8, alignItems: "center", justifyContent: "center" }}>
              <View style={{ 
                width: 24, 
                height: 24, 
                borderRadius: 12, 
                borderWidth: 2, 
                borderColor: "#1E293B",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <View style={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: 6, 
                  borderWidth: 1.5, 
                  borderColor: "#1E293B",
                }} />
              </View>
            </View>
            <SectionTitle style={{ marginBottom: 0, fontSize: 18, fontWeight: "600" }}>Your Progress</SectionTitle>
          </Row>

          {/* Stats Row */}
          <Row style={{ marginBottom: 20, justifyContent: "space-around" }}>
            <View style={{ alignItems: "center" }}>
              <BodyText style={{ fontSize: 30, fontWeight: "700", color: "#1E293B" }}>
                {stats?.totalScheduled || 0}
              </BodyText>
              <SecondaryText style={{ marginTop: 4, fontSize: 14 }}>Scheduled</SecondaryText>
            </View>
            <View style={{ alignItems: "center" }}>
              <BodyText style={{ fontSize: 30, fontWeight: "700", color: "#1E293B" }}>
                {stats?.totalCompleted || 0}
              </BodyText>
              <SecondaryText style={{ marginTop: 4, fontSize: 14 }}>Completed</SecondaryText>
            </View>
            <View style={{ alignItems: "center" }}>
              <BodyText style={{ fontSize: 30, fontWeight: "700", color: "#1E293B" }}>
                {stats?.completionRate || 0}%
              </BodyText>
              <SecondaryText style={{ marginTop: 4, fontSize: 14 }}>Rate</SecondaryText>
            </View>
          </Row>

          {/* Sessions by type with bar chart */}
          {stats && stats.sessionsByType.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <SecondaryText style={{ marginBottom: 12, fontSize: 14 }}>Sessions by type:</SecondaryText>
              
              {/* Bar chart visualization */}
              <View style={{ flexDirection: "row", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
                {stats.sessionsByType.map((item, index) => {
                  const colors = ["#7C3AED", "#10B981", "#3B82F6"];
                  const total = stats.sessionsByType.reduce((sum, s) => sum + s.count, 0);
                  const width = total > 0 ? (item.count / total) * 100 : 0;
                  return (
                    <View
                      key={item.sessionTypeId}
                      style={{
                        width: `${width}%`,
                        backgroundColor: colors[index % colors.length],
                        height: "100%",
                      }}
                    />
                  );
                })}
              </View>

              {/* Legend */}
              {stats.sessionsByType.map((item, index) => {
                const colors = ["#7C3AED", "#10B981", "#3B82F6"];
                return (
                  <Row key={item.sessionTypeId} style={{ marginBottom: 6 }}>
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors[index % colors.length],
                        marginRight: 8,
                        marginTop: 4,
                      }}
                    />
                    <BodyText style={{ fontSize: 14 }}>
                      {item.sessionTypeName} · {item.count}
                    </BodyText>
                  </Row>
                );
              })}
            </View>
          )}

          {/* Average spacing */}
          <Card style={{ backgroundColor: "#FFFFFF", marginTop: 8, padding: 12 }}>
            <Row>
              <BodyText style={{ fontSize: 18, marginRight: 8 }}>📈</BodyText>
              <View style={{ flex: 1 }}>
                <BodyText style={{ fontSize: 16, fontWeight: "600", marginBottom: 2 }}>
                  {stats?.averageSpacing || 0} days
                </BodyText>
                <SecondaryText style={{ fontSize: 12 }}>
                  Average spacing between sessions
                </SecondaryText>
              </View>
            </Row>
          </Card>
        </SectionCard>
        </ScrollContainer>
      </Container>
      
      <CreateSessionModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSessionCreated={async () => {
          // Store automatically updates all listeners, just refresh progress and suggestions
          await refetchProgress();
          // Refresh suggestions if needed
          if (sessionTypes.length > 0) {
            await handleGetSuggestions();
          }
        }}
        onNavigateToSessionTypes={() => {
          navigation.navigate("Settings", { screen: "SessionTypes" });
        }}
      />
      <EditSessionModal
        visible={!!editingSession}
        session={editingSession}
        onClose={() => setEditingSession(null)}
        onUpdate={handleEditSession}
        onDelete={handleDeleteSession}
      />
    </SafeAreaView>
  );
};

