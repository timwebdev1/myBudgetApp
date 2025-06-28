package org.moneymatters.mm_backend.controllers;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import org.moneymatters.mm_backend.data.*;
import org.moneymatters.mm_backend.models.*;
import org.moneymatters.mm_backend.models.dto.IncomeSplitDto;
import org.moneymatters.mm_backend.models.dto.TransactionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = {"http://localhost:3000", "https://mybudgetapp-fe.netlify.app"}, allowCredentials = "true")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private RecurringTransactionRepository recurringTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private SplitRepository splitRepository;

    @Autowired
    private Validator validator;


//    Create transaction with budget and tag assignment options
@PostMapping("/add")
    public ResponseEntity<?> addTransaction(@RequestBody @Valid TransactionDTO transactionDTO,
                                            @RequestParam Integer user_id,
                                            @RequestParam(required = false) Integer budget_id,
                                            @RequestParam(required = false) Integer tag_id) {

    if (transactionDTO.getAmount() == null) {
        return new ResponseEntity<>("Amount is null: ", HttpStatus.BAD_REQUEST);
    }

    System.out.println("Amount from DTO: " + transactionDTO.getAmount());
    System.out.println("Budget ID: " + budget_id);
    System.out.println("User ID: " + user_id);

    Transaction transaction = new Transaction();
    transaction.setAmount(transactionDTO.getAmount());
    transaction.setDescription(transactionDTO.getDescription());
    transaction.setRecurring(transactionDTO.isRecurring());
    transaction.setIsIncome(transactionDTO.isIncome());


    Optional<User> userOptional = userRepository.findById(user_id);
    if (userOptional.isEmpty()) {
        return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
    }
    transaction.setUser(userOptional.get());

    if  (budget_id != null) {
    Optional<Budget> budgetOptional = budgetRepository.findById(budget_id);
    if (budgetOptional.isEmpty()) {
        return new ResponseEntity<>("Budget not found", HttpStatus.NOT_FOUND);
    }
    transaction.setBudgetId(budgetOptional.get());
    }

    if (transactionDTO.getSplits() != null && !transactionDTO.getSplits().isEmpty()) {
        transaction.setSplit(true);
    }
    
    if (tag_id != null) {
        Optional<Tag> tagOptional = tagRepository.findById(tag_id);
        if (tagOptional.isEmpty()) {
            return new ResponseEntity<>("Tag not found", HttpStatus.NOT_FOUND);
        }
        if(!transaction.isSplit()) {
            transaction.setTag(tagOptional.get());
        }
    }



    Transaction savedTransaction = transactionRepository.save(transaction);

    if (transaction.isRecurring()){
        RecurringTransaction recurringTransaction= new RecurringTransaction();
        recurringTransaction.setTransaction(transaction);
        recurringTransaction.setAmount(transactionDTO.getAmount());
        recurringTransaction.setDescription(transactionDTO.getDescription());
        recurringTransaction.setIsIncome(transactionDTO.isIncome());
        recurringTransaction.setRecurringDay(transactionDTO.getRecurringDate());
        recurringTransaction.setTag(transaction.getTag());
        recurringTransaction.setUser(transaction.getUser());
        recurringTransaction.setBudgetId(transaction.getBudget());
        recurringTransaction.setNextTransactionDate(recurringTransaction.calculateNextTransactionDate());


        System.out.println("Received recurringTransaction: " +  recurringTransaction.getAmount());

        Set<ConstraintViolation<RecurringTransaction>> violations = validator.validate(recurringTransaction);
        if (!violations.isEmpty()) {
            String errorMessages = violations.stream()
                    .map(violation -> violation.getMessage())
                    .collect(Collectors.joining(", "));
            return new ResponseEntity<>(errorMessages, HttpStatus.BAD_REQUEST);
        }

        recurringTransactionRepository.save(recurringTransaction);
    }


    if(transactionDTO.getSplits() != null && !transactionDTO.getSplits().isEmpty()){
        for(TransactionDTO.SplitDto splitDto: transactionDTO.getSplits()){

            if (splitDto.getTag() == null || splitDto.getTag().isEmpty()){
                return new ResponseEntity<>("Tag name cannot be null or empty", HttpStatus.BAD_REQUEST);
            }


            Optional<Tag> tagOptional = tagRepository.findById(Integer.parseInt(splitDto.getTag()));
            if(tagOptional.isEmpty()){
                return new ResponseEntity<>("Tag not found for id: " + splitDto.getTag(),HttpStatus.NOT_FOUND);
            }

            Split split = new Split();
            split.setSplitAmount(splitDto.getSplitAmount());
            split.setTag(tagOptional.get());
            split.setTransaction(savedTransaction);
            splitRepository.save(split);
        }
    }

    return new ResponseEntity<>(true, HttpStatus.CREATED);
}
    @GetMapping("/{transactionId}/splits")
    public ResponseEntity<?> getSplitTransactions(@PathVariable Integer transactionId) {
        Optional<Transaction> transactionOptional = transactionRepository.findById(transactionId);
        if (transactionOptional.isEmpty()) {
            return new ResponseEntity<>("Transaction not found", HttpStatus.NOT_FOUND);
        }

        Transaction transaction = transactionOptional.get();
        List<TransactionDTO.SplitDto> splitDtos = transaction.getSplits().stream().map(split -> {
            TransactionDTO.SplitDto splitDto = new TransactionDTO.SplitDto();
            splitDto.setSplitAmount(split.getSplitAmount());
            splitDto.setTag(split.getTag() != null ? split.getTag().getName() : null);
            return splitDto;
        }).collect(Collectors.toList());

        return new ResponseEntity<>(splitDtos, HttpStatus.OK);
    }


//      View all transactions for a user
    @GetMapping("/user/{user_id}")
    public ResponseEntity<?> getUserTransactions(@PathVariable Integer user_id) {
    Optional<User> userOptional = userRepository.findById(user_id);
    if (userOptional.isEmpty()) {
        return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
    }
        List<Transaction> transactions = transactionRepository.findByUser(userOptional.get());
        List<TransactionDTO> transactionDTOs = transactions.stream().map(this::convertToDTO).collect(Collectors.toList());
        return new ResponseEntity<>(transactionDTOs, HttpStatus.OK);
    }


//    View all transactions by specific budget
    @GetMapping("/budget/{budget_id}")
    public ResponseEntity<?> getBudgetTransactions(@PathVariable Integer budget_id) {
    Optional<Budget> budgetOptional = budgetRepository.findById(budget_id);
    if (budgetOptional.isEmpty()) {
        return new ResponseEntity<>("Budget not found", HttpStatus.NOT_FOUND);
    }
    List<Transaction> transactions = transactionRepository.findByBudget(budgetOptional.get());

    List<TransactionDTO> transactionDTOS = transactions.stream().map(transaction -> {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setUserId(transaction.getUser().getUser_id());
        dto.setBudgetId(transaction.getBudget().getId());
        dto.setAmount(transaction.getAmount());
        dto.setDescription(transaction.getDescription());
        dto.setRecurring(transaction.isRecurring());
        dto.setIncome(transaction.isIncome());
        dto.setCreatedDate(transaction.getCreatedDate());

        // Map splits
        List<TransactionDTO.SplitDto> splitDtos = transaction.getSplits().stream().map(split -> {
            TransactionDTO.SplitDto splitDto = new TransactionDTO.SplitDto();
            splitDto.setSplitAmount(split.getSplitAmount());  // Assuming Split has an amount field
            splitDto.setTag(String.valueOf(split.getTag()));  // Assuming Split has a tag field
            return splitDto;
        }).collect(Collectors.toList());

        dto.setSplits(splitDtos);

        if (transaction.getTag() != null) {
            dto.setTagId(transaction.getTag().getId());
        }
        return dto;
    }).collect(Collectors.toList());

    return new ResponseEntity<>(transactionDTOS, HttpStatus.OK);
    }

//    View transactions by specific tag
    @GetMapping("/tag/{tag_id}")
    public ResponseEntity<?> getTagTransactions(@PathVariable Integer tag_id) {
    Optional<Tag> tagOptional = tagRepository.findById(tag_id);
    if (tagOptional.isEmpty()) {
        return new ResponseEntity<>("Tag not found", HttpStatus.NOT_FOUND   );
    }
    List<Transaction> transactions = transactionRepository.findByTag(tagOptional.get());
    return new ResponseEntity<>(transactions, HttpStatus.OK);
    }

//    View details of specific transaction
    @GetMapping("/view/{id}")
    public ResponseEntity<?> getTransaction(@PathVariable Integer id) {
    Optional<Transaction> transaction = transactionRepository.findById(id);
    if (transaction.isEmpty()) {
        return new ResponseEntity<>("Transaction not found", HttpStatus.NOT_FOUND);
    }
    return new ResponseEntity<>(transaction.get(), HttpStatus.OK);
    }

//    Update transaction with budget and tag reassignments
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTransaction(@PathVariable Integer id,
                                               @RequestBody @Valid Transaction transaction,
                                               @RequestParam(required = false) Integer budget_id,
                                               @RequestParam(required = false) Integer tag_id) {
//        Verify transaction exists
    Optional<Transaction> existingTransactionOpt = transactionRepository.findById(id);
    if (existingTransactionOpt.isEmpty()) {
        return new ResponseEntity<>("Transaction not found", HttpStatus.NOT_FOUND);
    }

    Transaction existingTransaction = existingTransactionOpt.get();
    existingTransaction.setAmount(transaction.getAmount());
    existingTransaction.setDescription(transaction.getDescription());
    existingTransaction.setIsIncome(transaction.isIncome());
    existingTransaction.setRecurring(transaction.isRecurring());

        if (budget_id != null) {
            Optional<Budget> budgetOptional = budgetRepository.findById(budget_id);
            if (budgetOptional.isEmpty()) {
                return new ResponseEntity<>("Budget not found", HttpStatus.NOT_FOUND);
            }
            existingTransaction.setBudgetId(budgetOptional.get());
        }

        if (tag_id != null) {
            Optional<Tag> tagOptional = tagRepository.findById(tag_id);
            if (tagOptional.isEmpty()) {
                return new ResponseEntity<>("Tag not found", HttpStatus.NOT_FOUND);
            }
            existingTransaction.setTag(tagOptional.get());
        }
        Transaction updatedTransaction = transactionRepository.save(existingTransaction);
        return new ResponseEntity<>(updatedTransaction, HttpStatus.OK);
    }

//    Delete a transaction
@DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Integer id) {
    Optional<Transaction> transactionOptional = transactionRepository.findById(id);
    if (transactionOptional.isEmpty()) {
        return new ResponseEntity<>("Budget not found", HttpStatus.NOT_FOUND);
    }
    transactionRepository.deleteById(id);
    return new ResponseEntity<>("Transaction deleted successfully", HttpStatus.OK);
}

    @GetMapping("/search")
    public ResponseEntity<?> searchTransactions(@RequestParam String query, @RequestParam Integer budget_id){
        List<Transaction> transactions = transactionRepository.findByDescriptionContainingIgnoreCase(query, budget_id);
        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }
    private TransactionDTO convertToDTO(Transaction transaction){
        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setAmount(transaction.getAmount());
        dto.setDescription(transaction.getDescription());
        dto.setIncome(transaction.isIncome());
        dto.setRecurring(transaction.isRecurring());
        dto.setCreatedDate(transaction.getCreatedDate());

        if(transaction.getUser() != null){
            dto.setUserId(transaction.getUser().getUser_id());
        }
         if(transaction.getBudget() != null){
             dto.setBudgetId(transaction.getBudget().getId());
         }
         if(transaction.getTag() != null){
             dto.setTagId(transaction.getTag().getId());
         }
         // convert splits if they exists
        if(transaction.getSplits() != null && !transaction.getSplits().isEmpty()){
            List<TransactionDTO.SplitDto> splitDtos = transaction.getSplits().stream().map(split -> {
                TransactionDTO.SplitDto splitDto = new TransactionDTO.SplitDto();
                splitDto.setSplitAmount(split.getSplitAmount());
                splitDto.setTag(String.valueOf(split.getTag().getId()));

                return splitDto;
            }).collect(Collectors.toList());
            dto.setSplits(splitDtos);

        }
        return dto;
    }




}

