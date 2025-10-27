"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import toast from "react-hot-toast";

const PaymentMethod: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-3 flex-1">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Card Payment</div>
                <div className="text-sm text-gray-500">Add your card details for payment</div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // TODO: Open card payment portal
                toast("Card payment portal will be implemented soon", { icon: 'ℹ️' });
              }}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              Add Card
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethod;
