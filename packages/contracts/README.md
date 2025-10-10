# Dream Contracts

This package contains Protocol Buffer definitions for Dream service contracts.

## Prerequisites

Install [buf](https://buf.build/docs/installation):

```bash
# macOS/Linux
brew install bufbuild/buf/buf

# Or with npm (requires @bufbuild/buf)
npm install -g @bufbuild/buf
```

## Generate Code

```bash
# Using make
make gen

# Or directly with buf
buf generate
```

Generated TypeScript code will be in `gen/ts/`.

## Usage

Import generated types in other packages:

```typescript
import { PlanInput, PlanOutput } from '@dream/contracts/gen/ts/agent_messages_pb';
```
