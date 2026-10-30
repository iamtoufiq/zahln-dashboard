import { clock } from "@/api/api-instance";
import { berlinDay } from "@/core";

// "Today" follows the server's Date header, not the laptop clock.
export const serverToday = (): string => berlinDay(new Date(clock.now()));
