import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, Res, HttpException, HttpStatus } from '@nestjs/common';
import { ReportsService } from './reports.service';
import {Request, Response} from "express";

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}


  @Get('total')
  async getAllTotal(
    @Req() req: Request
  ) {
    const totals = await this.reportsService.getAllTotal(req);
    return {
      message: "Request was successfull",
      data: totals,
      status:true
    }
  }

  @Get('expense_percentage')
  async getExpensePercentageByCategory(
    @Req() req: Request
  )  {
    const expenses = await this.reportsService.getPercentageOfExpenseToBudgetByCategories(req);
    return {
      message: "Request was successfull",
      data: expenses,
      status: true
    }
  }

  @Get()
  async getTotalAmountForTheMonth(
    @Query('year') year: string,
    @Query('month') month: string,
    @Req() req: Request
  ) {
    const amount = await this.reportsService.generateTotalForAmount(req, +year, month);
    return {
      message: "Request was successful",
      data: amount,
      status: true
    }
  }

  @Get('monthly-trends')
  async getMonthlyTrends(
    @Req() req: Request
  ) {
    const trends = await this.reportsService.getMonthlyTrends(req);
    return {
      message: "Request was successful",
      data: trends,
      status: true
    }
  }

  @Get('category-breakdown')
  async getCategoryWiseBreakdown(
    @Req() req: Request
  ) {
    const breakdown = await this.reportsService.getCategoryWiseBreakdown(req);
    return {
      message: "Request was successful",
      data: breakdown,
      status: true
    }
  }

  @Get('annual-budget')
  async getAnnualBudgetPlanning(
    @Req() req: Request
  ) {
    const budget = await this.reportsService.getAnnualBudgetPlanning(req);
    return {
      message: "Request was successful",
      data: budget,
      status: true
    }
  }

  @Get('forecast-expenses')
  async forecastExpenses(@Req() req: Request) {
    try {
      const forecast = await this.reportsService.forecastExpenses(req);
      return {
        message: "Request was successful",
        data: forecast,
        status: true
      }
    } catch (error) {
      console.error(error);
      throw new HttpException("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('custom-report')
  async generateCustomReport(
    @Req() req: Request,
    @Body() startDate: string,
    @Body() endDate: string
) {
    try {
      const report = await this.reportsService.generateCustomReport(req, new Date(startDate), new Date(endDate));
      return {
        message: "Request was successful",
        data: report,
        status: true
      }
    } catch (error) {
      console.error(error);
      throw new HttpException("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('budget-alerts')
  async checkBudgetAlerts(@Req() req: Request) {
    try {
      const alerts = await this.reportsService.checkBudgetAlerts(req);
      return {
        message: "Request was successful",
        data: alerts,
        status: true
      }
    } catch (error) {
      console.error(error);
      throw new HttpException("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('export-pdf')
async exportReportToPDF(
    @Req() req: Request, 
    @Res({passthrough: true}) res: Response
) {
    try {
        const userId = req.user.id;
        const pdfBuffer = await this.reportsService.generatePDFReport(userId);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="report.pdf"',
            'Content-Length': pdfBuffer.length,
        });

        res.end(pdfBuffer);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}

}
