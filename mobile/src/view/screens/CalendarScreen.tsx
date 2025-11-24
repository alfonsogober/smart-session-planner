/**
 * Calendar screen component
 */
import React, { useState } from "react";
import { ScrollContainer, Container, Title, SectionTitle, Card, Row, SpaceBetween, BodyText, SecondaryText } from "../components/StyledComponents";
import { SessionCard } from "../components/SessionCard";
import { useSessions } from "../../controller/useSessions";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek, addMonths, subMonths, parseISO } from "date-fns";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Session } from "../../model/types";
import { theme } from "../../styles/theme";
import { findConflictingSessions } from "../../model/session";
import { SessionConflictIndicator } from "../components/SessionConflictIndicator";
import { EditSessionModal } from "../components/EditSessionModal";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

/**
 * Calendar screen component
 */
export const CalendarScreen: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const { sessions, updateSession, deleteSession, refetch, loading } = useSessions();

  // Sessions auto-update via store, no need to refetch on focus

  // Get sessions for selected date
  const getSessionsForDate = (date: Date): Session[] => {
    return sessions.filter((session) => {
      // Parse UTC ISO string and compare in local timezone
      const sessionDate = parseISO(session.startTime);
      return isSameDay(sessionDate, date);
    });
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      const newCompletedState = session ? !session.completed : true;
      await updateSession(sessionId, { completed: newCompletedState });
      await refetch();
    } catch (error) {
      console.error("Failed to complete session:", error);
    }
  };

  const handleEditSession = async (id: string, data: { completed?: boolean; startTime?: string; endTime?: string }) => {
    try {
      await updateSession(id, data);
      await refetch();
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteSession(id);
      await refetch();
    } catch (error) {
      throw error;
    }
  };

  const selectedDateSessions = selectedDate ? getSessionsForDate(selectedDate) : [];

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
            <Title style={{ marginBottom: 16 }}>Calendar</Title>
            
            {/* Month Navigation */}
            <Row style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="Previous month"
                accessibilityRole="button"
                onPress={handlePreviousMonth}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF",
                }}
              >
                <BodyText style={{ fontSize: 18 }}>←</BodyText>
              </TouchableOpacity>
              
              <BodyText style={{ fontSize: 18, fontWeight: "600" }}>
                {format(currentMonth, "MMMM yyyy")}
              </BodyText>
              
              <TouchableOpacity
                accessible={true}
                accessibilityLabel="Next month"
                accessibilityRole="button"
                onPress={handleNextMonth}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF",
                }}
              >
                <BodyText style={{ fontSize: 18 }}>→</BodyText>
              </TouchableOpacity>
            </Row>
          </View>

          {/* Calendar Grid */}
          <Card style={{ marginBottom: 24, padding: 16 }}>
            {/* Day headers */}
            <Row style={{ marginBottom: 8 }}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <View key={day} style={{ flex: 1, alignItems: "center" }}>
                  <SecondaryText style={{ fontSize: 12, fontWeight: "600" }}>{day}</SecondaryText>
                </View>
              ))}
            </Row>

            {/* Calendar days */}
            <View>
              {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIndex) => (
                <Row key={weekIndex} style={{ marginBottom: 4 }}>
                  {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day) => {
                    const daySessions = getSessionsForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentDay = isToday(day);

                    return (
                      <TouchableOpacity
                        key={day.toISOString()}
                        accessible={true}
                        accessibilityLabel={`${format(day, "MMMM d")}${daySessions.length > 0 ? `, ${daySessions.length} sessions` : ""}`}
                        accessibilityRole="button"
                        onPress={() => setSelectedDate(day)}
                        style={{
                          flex: 1,
                          aspectRatio: 1,
                          alignItems: "center",
                          justifyContent: "center",
                          margin: 2,
                          borderRadius: 8,
                          backgroundColor: isSelected ? "#1E3A8A" : isCurrentDay ? "#E0F2FE" : "transparent",
                          opacity: isCurrentMonth ? 1 : 0.3,
                        }}
                      >
                        <BodyText
                          style={{
                            fontSize: 14,
                            fontWeight: isCurrentDay ? "700" : "400",
                            color: isSelected ? "#FFFFFF" : isCurrentDay ? "#1E3A8A" : "#1E293B",
                          }}
                        >
                          {format(day, "d")}
                        </BodyText>
                        {daySessions.length > 0 && (
                          <View
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: isSelected ? "#FFFFFF" : "#1E3A8A",
                              marginTop: 2,
                            }}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </Row>
              ))}
            </View>
          </Card>

          {/* Selected Date Sessions */}
          {selectedDate && (
            <View style={{ marginBottom: 24 }}>
              <SectionTitle style={{ fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
                {format(selectedDate, "EEEE, MMMM d")}
              </SectionTitle>

              {loading ? (
                <ActivityIndicator size="small" color="#1E3A8A" />
              ) : selectedDateSessions.length === 0 ? (
                <Card>
                  <SecondaryText>No sessions scheduled for this day</SecondaryText>
                </Card>
              ) : (
                selectedDateSessions.map((session) => {
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
              )}
            </View>
          )}
        </ScrollContainer>
      </Container>

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

