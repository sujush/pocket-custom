'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
  storageDays: z.number().int().positive(),
  appraisedValue: z.number().int().nonnegative(),
  cbm: z.number().positive(),
  weight: z.number().positive(),
});

export function WarehouseCostForm() {
  const [calculationResult, setCalculationResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storageDays: undefined, // 기본값을 undefined로 설정
      appraisedValue: undefined, 
      cbm: undefined,
      weight: undefined,
    },
  });

  // Lambda API 호출 함수
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Lambda API 호출
      const response = await fetch('https://7716t0w0u7.execute-api.ap-northeast-2.amazonaws.com/warehouse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      // 응답 데이터 파싱
      const data = await response.json();
      setCalculationResult(data.result); // 계산 결과 저장
    } catch (error) {
      console.error('계산 중 오류가 발생했습니다:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4 border p-4 rounded">
            <FormField
              control={form.control}
              name="storageDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>창고 보관일수</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="일수 입력"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)} // undefined로 설정
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appraisedValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>감정가액</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="감정가액 = CIF 과세가격 + 관세"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 border p-4 rounded">
            <FormField
              control={form.control}
              name="cbm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CBM</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="CBM = 가로x세로x높이x박스개수"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>중량</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="kg단위"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? '계산 중...' : '계산하기'}
        </Button>

        {/* 결과가 있는 경우 아래에 결과를 표시 */}
        {calculationResult !== null && (
          <div className="mt-4 p-4 bg-blue-100 rounded-md">
            <h2 className="text-xl font-semibold mb-2">계산 결과</h2>
            <p className="text-2xl font-bold text-blue-800">{calculationResult.toLocaleString()}원</p>
          </div>
        )}
      </form>
    </Form>
  );
}
