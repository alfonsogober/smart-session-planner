/**
 * Stats screen component
 */
import React from "react";
import { ScrollContainer, Container, Title, SectionTitle, SectionCard, Card, Row, SpaceBetween, BodyText, SecondaryText } from "../components/StyledComponents";
import { useProgress } from "../../controller/useProgress";
import { useSessionTypes } from "../../controller/useSessionTypes";
import { format } from "date-fns";
import { View, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../styles/theme";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

/**
 * Stats screen component
 */
export const StatsScreen: React.FC = () => {
  const { stats, loading, error, refetch } = useProgress();
  const { sessionTypes } = useSessionTypes();
  const [refreshing, setRefreshing] = React.useState(false);

  // Stats refresh handled by useProgress hook

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Debug: Log stats to see what we're getting
  React.useEffect(() => {
    console.log("StatsScreen - Current stats:", stats);
    console.log("StatsScreen - Loading:", loading);
    console.log("StatsScreen - Error:", error);
  }, [stats, loading, error]);

  // Show loading only on initial load, not when refreshing
  if (loading && !stats && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={['top']}>
        <Container style={{ justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </Container>
      </SafeAreaView>
    );
  }

  if (error) {
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
          >
            <Card style={{ backgroundColor: "#FEE2E2", padding: 16 }}>
              <BodyText style={{ color: "#DC2626" }}>Error: {error}</BodyText>
            </Card>
          </ScrollContainer>
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E3A8A" />
          }
        >
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Title style={{ marginBottom: 8 }}>Statistics</Title>
            <SecondaryText style={{ fontSize: 14 }}>
              Your progress and performance metrics
            </SecondaryText>
          </View>

          {/* Overall Stats */}
          <SectionCard style={{ marginBottom: 24, backgroundColor: "#E0F2FE", padding: 24 }}>
            <Row style={{ marginBottom: 20, alignItems: "center" }}>
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
              <SectionTitle style={{ marginBottom: 0, fontSize: 18, fontWeight: "600" }}>
                Overall Progress
              </SectionTitle>
            </Row>

            {/* Stats Grid */}
            <Row style={{ flexWrap: "wrap", marginBottom: 16, justifyContent: "space-between" }}>
              <View style={{ width: "47%", marginBottom: 16 }}>
                <Card style={{ backgroundColor: "#FFFFFF", padding: 16, alignItems: "center", marginBottom: 0 }}>
                  <BodyText style={{ fontSize: 32, fontWeight: "700", color: "#1E293B" }}>
                    {stats ? stats.totalScheduled : 0}
                  </BodyText>
                  <SecondaryText style={{ marginTop: 4, fontSize: 14 }}>Total Scheduled</SecondaryText>
                </Card>
              </View>
              <View style={{ width: "47%", marginBottom: 16 }}>
                <Card style={{ backgroundColor: "#FFFFFF", padding: 16, alignItems: "center", marginBottom: 0 }}>
                  <BodyText style={{ fontSize: 32, fontWeight: "700", color: "#1E293B" }}>
                    {stats ? stats.totalCompleted : 0}
                  </BodyText>
                  <SecondaryText style={{ marginTop: 4, fontSize: 14 }}>Total Completed</SecondaryText>
                </Card>
              </View>
              <View style={{ width: "47%", marginBottom: 16 }}>
                <Card style={{ backgroundColor: "#FFFFFF", padding: 16, alignItems: "center", marginBottom: 0 }}>
                  <BodyText style={{ fontSize: 32, fontWeight: "700", color: "#1E293B" }}>
                    {stats ? stats.completionRate : 0}%
                  </BodyText>
                  <SecondaryText style={{ marginTop: 4, fontSize: 14 }}>Completion Rate</SecondaryText>
                </Card>
              </View>
              <View style={{ width: "47%", marginBottom: 16 }}>
                <Card style={{ backgroundColor: "#FFFFFF", padding: 16, alignItems: "center", marginBottom: 0 }}>
                  <BodyText style={{ fontSize: 32, fontWeight: "700", color: "#1E293B" }}>
                    {stats ? stats.averageSpacing : 0}
                  </BodyText>
                  <SecondaryText style={{ marginTop: 4, fontSize: 14 }}>Avg. Spacing (days)</SecondaryText>
                </Card>
              </View>
            </Row>
          </SectionCard>

          {/* Sessions by Type */}
          {stats && stats.sessionsByType.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <SectionTitle style={{ fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
                Sessions by Type
              </SectionTitle>

              {stats.sessionsByType.map((item, index) => {
                const sessionType = sessionTypes.find((st) => st.id === item.sessionTypeId);
                const colors = ["#7C3AED", "#10B981", "#3B82F6", "#F59E0B", "#EF4444"];
                const total = stats.sessionsByType.reduce((sum, s) => sum + s.count, 0);
                const percentage = total > 0 ? (item.count / total) * 100 : 0;

                return (
                  <Card key={item.sessionTypeId} style={{ marginBottom: 12, padding: 16 }}>
                    <Row style={{ marginBottom: 8, justifyContent: "space-between", alignItems: "center" }}>
                      <View style={{ flex: 1 }}>
                        <BodyText style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
                          {item.sessionTypeName}
                        </BodyText>
                        <SecondaryText style={{ fontSize: 14 }}>
                          {item.count} session{item.count !== 1 ? "s" : ""}
                        </SecondaryText>
                      </View>
                      <BodyText style={{ fontSize: 18, fontWeight: "700", color: colors[index % colors.length] }}>
                        {Math.round(percentage)}%
                      </BodyText>
                    </Row>
                    
                    {/* Progress bar */}
                    <View
                      style={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#E2E8F0",
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          width: `${percentage}%`,
                          height: "100%",
                          backgroundColor: colors[index % colors.length],
                        }}
                      />
                    </View>
                  </Card>
                );
              })}
            </View>
          )}

          {/* Additional Metrics */}
          <SectionCard style={{ backgroundColor: "#F1F5F9" }}>
            <SectionTitle style={{ fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
              Additional Metrics
            </SectionTitle>

            <Card style={{ backgroundColor: "#FFFFFF", marginBottom: 12, padding: 16 }}>
              <Row style={{ alignItems: "center" }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#DDD6FE", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                  <BodyText style={{ fontSize: 20 }}>📈</BodyText>
                </View>
                <View style={{ flex: 1 }}>
                  <BodyText style={{ fontSize: 16, fontWeight: "600", marginBottom: 2 }}>
                    Average Spacing
                  </BodyText>
                  <SecondaryText style={{ fontSize: 14 }}>
                    {stats?.averageSpacing || 0} days between sessions
                  </SecondaryText>
                </View>
              </Row>
            </Card>

            {stats && stats.totalScheduled > 0 && (
              <Card style={{ backgroundColor: "#FFFFFF", padding: 16 }}>
                <Row style={{ alignItems: "center" }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#D1FAE5", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                    <BodyText style={{ fontSize: 20 }}>✓</BodyText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <BodyText style={{ fontSize: 16, fontWeight: "600", marginBottom: 2 }}>
                      Completion Rate
                    </BodyText>
                    <SecondaryText style={{ fontSize: 14 }}>
                      {stats.completionRate}% of scheduled sessions completed
                    </SecondaryText>
                  </View>
                </Row>
              </Card>
            )}
          </SectionCard>
        </ScrollContainer>
      </Container>
    </SafeAreaView>
  );
};


