import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { UserRole, Spot } from "../types";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { QRCodeCanvas } from "qrcode.react";
import { usePayments } from "../contexts/PaymentContext";
import { mockApi } from "../services/mockApi";

/* -------------------------------------------------------------------------- */
/* Status Badge */
/* -------------------------------------------------------------------------- */

const PaymentStatusBadge: React.FC<{ paid: boolean }> = ({ paid }) => (
  <span
    className={`px-2 py-1 text-xs font-semibold rounded-full border ${
      paid
        ? "bg-green-500/20 text-green-300 border-green-500"
        : "bg-red-500/20 text-red-300 border-red-500"
    }`}
  >
    {paid ? "Paid" : "Not Paid"}
  </span>
);

/* -------------------------------------------------------------------------- */
/* Page */
/* -------------------------------------------------------------------------- */

const PaymentPage: React.FC = () => {
  const { profile } = useAuth();
  const { payments, markPaid, undoPaid } = usePayments();

  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSpot = async () => {
      const data = await mockApi.getUpcomingSpot();
      setSpot(data ?? null);
      setLoading(false);
    };
    loadSpot();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading payments...</div>;
  }

  if (!spot) {
    return (
      <Card>
        <p className="text-center text-gray-400">
          No upcoming spot available.
        </p>
      </Card>
    );
  }

  const isAdmin = profile?.role === UserRole.ADMIN;
  const members = spot.members ?? [];

  /* ------------------------------------------------------------------------ */
  /* UPI CONFIG */
  /* ------------------------------------------------------------------------ */

  const amount = spot.budget;
  const payeeVPA = "adminbro@upi"; // change to your real UPI ID
  const payeeName = "Admin Bro";

  const baseUpi = `upi://pay?pa=${payeeVPA}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount}&cu=INR&tn=BroCode%20Spot%20Payment`;

  const openUPI = (app: "gpay" | "phonepe" | "paytm" | "navi") => {
    let url = baseUpi;

    if (app === "gpay") url = `tez://upi/pay?${baseUpi.split("?")[1]}`;
    if (app === "phonepe") url = `phonepe://pay?${baseUpi.split("?")[1]}`;
    if (app === "paytm") url = `paytmmp://pay?${baseUpi.split("?")[1]}`;
    if (app === "navi") url = `navi://pay?${baseUpi.split("?")[1]}`;

    window.location.href = url;
  };

  return (
    <div className="space-y-8 pb-20">
      <h1 className="text-3xl font-bold">Payment</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* ---------------- SCAN TO PAY ---------------- */}
        <Card className="flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold mb-4">Scan to Pay</h2>

          <div className="bg-white p-4 rounded-xl">
            <QRCodeCanvas value={baseUpi} size={200} />
          </div>

          <p className="mt-3 text-sm text-gray-400">
            Amount: ₹{amount}
          </p>

          {/* UPI APP BUTTONS */}
          <div className="grid grid-cols-2 gap-3 mt-5 w-full">
            <Button onClick={() => openUPI("gpay")}>Google Pay</Button>
            <Button onClick={() => openUPI("phonepe")}>PhonePe</Button>
            <Button onClick={() => openUPI("paytm")}>Paytm</Button>
            <Button onClick={() => openUPI("navi")}>Navi</Button>
          </div>
        </Card>

        {/* ---------------- PAYMENT BREAKDOWN ---------------- */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">
            Payment Breakdown
          </h2>

          {members.length === 0 ? (
            <p className="text-sm text-gray-400 text-center">
              No members found.
            </p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => {
                const paid = payments[member.id]?.paid ?? false;

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          member.profile_pic_url ||
                          "https://api.dicebear.com/7.x/thumbs/svg?seed=user"
                        }
                        alt={member.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className="font-medium">
                        {member.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <PaymentStatusBadge paid={paid} />

                      {isAdmin && !paid && (
                        <Button
                          size="sm"
                          onClick={() => markPaid(member.id)}
                        >
                          Mark Paid
                        </Button>
                      )}

                      {isAdmin && paid && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => undoPaid(member.id)}
                        >
                          Undo
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;
