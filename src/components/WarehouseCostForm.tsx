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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  port: z.enum(['incheon', 'busan']),
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
      port: 'incheon',
      storageDays: undefined,
      appraisedValue: undefined, 
      cbm: undefined,
      weight: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch('https://7716t0w0u7.execute-api.ap-northeast-2.amazonaws.com/warehouse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      setCalculationResult(data.result);
    } catch (error) {
      console.error('계산 중 오류가 발생했습니다:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">항구 및 보관 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>항구 선택</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="항구를 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="incheon">인천항</SelectItem>
                        <SelectItem value="busan">부산항</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">물품 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? '계산 중...' : '계산하기'}
        </Button>

        {calculationResult !== null && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-blue-800">계산 결과</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-800">
                {form.getValues('port') === 'incheon' ? '인천항' : '부산항'} 창고료: {calculationResult.toLocaleString()}원
              </p>
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
}