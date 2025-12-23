import { ExecutionContext, Injectable } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { ThrottlerGuard as NestThrottlerGuard } from '@nestjs/throttler'

@Injectable()
export class ThrottlerGuard extends NestThrottlerGuard {
  override getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context)
    const ctx = gqlCtx.getContext()

    // For GraphQL requests, extract from context
    if (ctx?.request && ctx?.reply) {
      return { req: ctx.request, res: ctx.reply }
    }

    // Fallback to HTTP context for REST requests
    return super.getRequestResponse(context)
  }
}
