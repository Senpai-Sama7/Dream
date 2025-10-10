import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import promClient from "prom-client";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

export const metricsRegistry = new promClient.Registry();
promClient.collectDefaultMetrics({ register: metricsRegistry });

export function startTelemetry(serviceName: string) {
  const sdk = new NodeSDK({
    instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
    serviceName
  });
  sdk.start();
  return sdk;
}

export function requestCounter(name = "http_requests_total") {
  return new promClient.Counter({
    name,
    help: "HTTP requests count",
    registers: [metricsRegistry],
    labelNames: ["method", "route", "status"]
  });
}
