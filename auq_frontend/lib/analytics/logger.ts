import { supabase } from "@/lib/supabase-client"
import type { BaseEvent, UserEvent, EventType } from "./types"

// Tipo para la tabla user_events en Supabase
type UserEvent = {
  user_id: string
  event_type: string
  event_details: Record<string, unknown>
  created_at?: string
}

class AnalyticsLogger {
  private static instance: AnalyticsLogger;
  private queue: UserEvent[] = [];
  private isProcessing = false;
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL = 5000; // 5 segundos
  
  // Configuración basada en variables de entorno
  private readonly isDevelopment = process.env.NODE_ENV === 'development';
  private readonly enableAnalytics = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';
  private readonly logToConsole = process.env.NEXT_PUBLIC_LOG_ANALYTICS === 'true';

  private constructor() {
    // Solo iniciar el procesamiento periódico si analytics está habilitado
    if (this.enableAnalytics) {
      setInterval(() => this.processQueue(), this.FLUSH_INTERVAL);
    }
  }

  public static getInstance(): AnalyticsLogger {
    if (!AnalyticsLogger.instance) {
      AnalyticsLogger.instance = new AnalyticsLogger();
    }
    return AnalyticsLogger.instance;
  }

  /**
   * Registra un evento en la cola
   */
  public async logEvent(event: BaseEvent): Promise<void> {
    try {
      // En desarrollo, loguear en consola si está habilitado
      if (this.isDevelopment && this.logToConsole) {
        console.log('Analytics Event:', event);
      }

      // Si analytics está deshabilitado, no procesar el evento
      if (!this.enableAnalytics) {
        return;
      }

      // Validar el evento
      if (!this.isValidEvent(event)) {
        console.error('Invalid event:', event);
        return;
      }

      // Convertir el evento al formato de Supabase
      const userEvent: UserEvent = {
        user_id: event.user_id,
        event_type: event.event_type,
        event_details: {
          ...event.event_details,
          timestamp: new Date().toISOString()
        }
      };

      // Añadir a la cola
      this.queue.push(userEvent);

      // Si la cola está llena, procesar inmediatamente
      if (this.queue.length >= this.BATCH_SIZE) {
        await this.processQueue();
      }
    } catch (error) {
      console.error('Error logging event:', error);
    }
  }

  /**
   * Procesa la cola de eventos
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0 || !this.enableAnalytics) return;

    this.isProcessing = true;
    const batch = this.queue.splice(0, this.BATCH_SIZE);

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await supabase
        .from('user_events')
        .insert(batch);

      if (error) {
        console.error('Error inserting events:', error);
        // Reintentar los eventos fallidos
        this.queue.unshift(...batch);
      }
    } catch (error) {
      console.error('Error processing queue:', error);
      // Reintentar los eventos fallidos
      this.queue.unshift(...batch);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Valida que el evento tenga la estructura correcta
   */
  private isValidEvent(event: BaseEvent): boolean {
    return Boolean(
      event.user_id &&
      typeof event.user_id === 'string' &&
      event.event_type &&
      typeof event.event_type === 'string'
    );
  }

  /**
   * Registra un error
   */
  public async logError(error: Error, user_id: string, component?: string): Promise<void> {
    // En desarrollo, loguear en consola si está habilitado
    if (this.isDevelopment && this.logToConsole) {
      console.error('Analytics Error:', { error, user_id, component });
    }

    // Si analytics está deshabilitado, no procesar el error
    if (!this.enableAnalytics) {
      return;
    }

    await this.logEvent({
      user_id,
      event_type: 'error.occurred',
      event_details: {
        error_type: error.name,
        error_message: error.message,
        component,
        stack_trace: error.stack,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Exportar una instancia única del logger
export const analyticsLogger = AnalyticsLogger.getInstance();