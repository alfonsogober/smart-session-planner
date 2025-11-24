/**
 * Styled components for the application
 */
import styled from "styled-components/native";
import { theme } from "../../styles/theme";

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.main};
`;

export const ScrollContainer = styled.ScrollView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.main};
`;

export const Card = styled.View`
  background-color: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
`;

export const SectionCard = styled.View`
  background-color: ${({ theme }) => theme.colors.background.section};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const Title = styled.Text.attrs({
  allowFontScaling: true,
  maxFontSizeMultiplier: 1.3,
})`
  font-size: ${({ theme }) => theme.typography.fontSize["2xl"]}px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const SectionTitle = styled.Text.attrs({
  allowFontScaling: true,
  maxFontSizeMultiplier: 1.3,
})`
  font-size: ${({ theme }) => theme.typography.fontSize.lg}px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const BodyText = styled.Text.attrs({
  allowFontScaling: true,
  maxFontSizeMultiplier: 1.3,
})`
  font-size: ${({ theme }) => theme.typography.fontSize.base}px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const SecondaryText = styled.Text.attrs({
  allowFontScaling: true,
  maxFontSizeMultiplier: 1.3,
})`
  font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Button = styled.TouchableOpacity.attrs<{ variant?: "primary" | "secondary" }>(({ variant, theme }) => ({
  style: {
    backgroundColor: variant === "primary" ? theme.colors.primary.main : theme.colors.background.card,
  },
}))<{ variant?: "primary" | "secondary" }>`
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  align-items: center;
  justify-content: center;
`;

export const ButtonText = styled.Text.attrs<{ variant?: "primary" | "secondary" }>(({ variant, theme }) => ({
  style: {
    color: variant === "primary" ? "#FFFFFF" : theme.colors.text.primary,
  },
}))<{ variant?: "primary" | "secondary" }>`
  font-size: ${({ theme }) => theme.typography.fontSize.base}px;
  font-weight: 600;
`;

export const IconButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  background-color: ${({ theme }) => theme.colors.primary.main};
  align-items: center;
  justify-content: center;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const SpaceBetween = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

