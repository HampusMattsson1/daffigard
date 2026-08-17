Before
container stats --no-stream --format table daff-test
Container ID  Cpu %    Memory Usage           Net Rx/Tx               Block I/O               Pids
daff-test     198.09%  858.83 MiB / 1.00 GiB  619.12 KiB / 16.85 KiB  360.06 MiB / 16.57 MiB  104
hjm@MacBook-Air-som-tillhor-Hampus ~ % container stats --no-stream --format table daff-test
Container ID  Cpu %   Memory Usage            Net Rx/Tx              Block I/O              Pids
daff-test     66.18%  1006.03 MiB / 1.00 GiB  3.23 MiB / 168.43 KiB  1.69 GiB / 463.51 MiB  161
hjm@MacBook-Air-som-tillhor-Hampus ~ % container stats --no-stream --format table daff-test
Container ID  Cpu %    Memory Usage            Net Rx/Tx              Block I/O            Pids
daff-test     131.94%  1005.14 MiB / 1.00 GiB  7.46 MiB / 310.81 KiB  8.76 GiB / 1.20 GiB  187

After
