import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ExcludeNullInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((value) => this.transformResponse(value))
    );
  }

  private transformResponse(value: any): any {
    if (value === null) {
      return ''; // Replace null with empty string
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.transformResponse(item)); // Recursively handle arrays
    }

    // if (typeof value === 'object' && value !== null) {
    //   return Object.fromEntries(
    //     Object.entries(value).map(([key, val]) => [
    //       key,
    //       this.transformResponse(val),
    //     ])
    //   );
    // }

    if (value instanceof Date) {
      return this.formatDate(value); // Format date object
    }

    return value; // Return value as is if it's not null, array, or object
  }

  private formatDate(date: Date): string {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // Use 24-hour format
    }).replace(',', ''); // Removes the comma
  }
}
