import React, { useEffect, useState } from 'react';
import { fetchBillingAccount } from '../api/fhir';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { DollarSign, CreditCard, AlertCircle, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Props {
  patientId: string;
  accessToken?: string;
}

export function BillingInfo({ patientId, accessToken }: Props) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchBillingAccount(patientId, accessToken)
      .then(data => {
        if (data?.entry) {
          setAccounts(data.entry.map((e: any) => e.resource));
        } else {
          setAccounts([]);
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [patientId, accessToken]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-sm">Loading billing information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Billing Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
            <AlertCircle className="w-4 h-4" />
            <span>No billing records found</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => {
    return sum + (account.balance?.value || 0);
  }, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Billing Accounts
            <Badge variant="outline" className="ml-2">{accounts.length}</Badge>
          </CardTitle>
          {totalBalance > 0 && (
            <div className="text-right">
              <div className="text-xs text-gray-600">Total Balance</div>
              <div className="text-lg text-red-600">
                ${totalBalance.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.map((account, index) => {
          const balance = account.balance?.value || 0;
          const currency = account.balance?.currency || 'USD';
          const accountType = account.type?.coding?.[0]?.display || account.type?.text || 'Account';
          const status = account.status || 'unknown';
          
          // Parse period dates
          const periodStart = account.servicePeriod?.start 
            ? new Date(account.servicePeriod.start).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            : null;
          
          const periodEnd = account.servicePeriod?.end 
            ? new Date(account.servicePeriod.end).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            : null;

          // Status badge styling
          const getStatusBadge = (status: string) => {
            switch (status.toLowerCase()) {
              case 'active':
                return { color: 'bg-green-100 text-green-700', icon: CheckCircle };
              case 'inactive':
                return { color: 'bg-gray-100 text-gray-700', icon: XCircle };
              case 'on-hold':
                return { color: 'bg-yellow-100 text-yellow-700', icon: Clock };
              default:
                return { color: 'bg-gray-100 text-gray-700', icon: AlertCircle };
            }
          };

          const statusBadge = getStatusBadge(status);
          const StatusIcon = statusBadge.icon;

          return (
            <div 
              key={account.id} 
              className={`border rounded-lg p-4 ${balance > 0 ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{account.name || accountType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusBadge.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status}
                    </Badge>
                    {account.type?.coding?.[0]?.code && (
                      <Badge variant="outline" className="text-xs">
                        {account.type.coding[0].code}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600 mb-1">Balance</div>
                  <div className={`text-xl ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${balance.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">{currency}</div>
                </div>
              </div>

              {/* Service Period */}
              {(periodStart || periodEnd) && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-3 pt-3 border-t">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>
                    Service Period: {periodStart || 'N/A'} - {periodEnd || 'Ongoing'}
                  </span>
                </div>
              )}

              {/* Account Description */}
              {account.description && (
                <div className="text-xs text-gray-600 mt-2 pt-2 border-t">
                  {account.description}
                </div>
              )}

              {/* Guarantor Info */}
              {account.guarantor && account.guarantor.length > 0 && (
                <div className="text-xs text-gray-600 mt-2 pt-2 border-t">
                  <span className="text-gray-500">Guarantor: </span>
                  {account.guarantor[0].party?.display || 'Unknown'}
                </div>
              )}

              {/* Coverage Info */}
              {account.coverage && account.coverage.length > 0 && (
                <div className="text-xs text-gray-600 mt-2">
                  <span className="text-gray-500">Coverage: </span>
                  {account.coverage.map((cov: any, i: number) => (
                    <Badge key={i} variant="outline" className="ml-1 text-xs">
                      {cov.coverage?.display || `Coverage ${i + 1}`}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Total Summary */}
        {accounts.length > 1 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Total across {accounts.length} accounts
              </div>
              <div className={`text-lg ${totalBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${totalBalance.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* FHIR Debug Info - Remove in production */}
        <div className="pt-4 border-t">
          <details className="text-xs">
            <summary className="text-gray-500 cursor-pointer">
              FHIR Account Resources ({accounts.length} accounts)
            </summary>
            <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(accounts, null, 2)}
            </pre>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
