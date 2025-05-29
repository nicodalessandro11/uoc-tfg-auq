import { analyticsLogger } from "@/lib/analytics/logger"

// Cuando se visualiza un indicador
const handleIndicatorView = async (indicator: any) => {
    if (user) {
        await analyticsLogger.logEvent({
            user_id: user.id,
            event_type: 'indicator.view',
            event_details: {
                indicator_id: indicator.id,
                indicator_name: indicator.name,
                value: indicator.value
            }
        })
    }
    // ... resto del código existente ...
}

// Cuando se comparan indicadores
const handleIndicatorCompare = async (indicator1: any, indicator2: any) => {
    if (user) {
        await analyticsLogger.logEvent({
            user_id: user.id,
            event_type: 'indicator.compare',
            event_details: {
                indicator1_id: indicator1.id,
                indicator1_name: indicator1.name,
                indicator2_id: indicator2.id,
                indicator2_name: indicator2.name,
                comparison_type: 'direct'
            }
        })
    }
    // ... resto del código existente ...
} 