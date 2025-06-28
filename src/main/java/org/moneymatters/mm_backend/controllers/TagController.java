package org.moneymatters.mm_backend.controllers;

import jakarta.validation.Valid;
import org.moneymatters.mm_backend.data.TagRepository;
import org.moneymatters.mm_backend.data.UserRepository;
import org.moneymatters.mm_backend.models.Tag;
import org.moneymatters.mm_backend.models.User;
import org.moneymatters.mm_backend.models.dto.TagDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tags")
@CrossOrigin(origins = {"http://localhost:3000", "https://mybudgetapp-fe.netlify.app"}, allowCredentials = "true")
public class TagController {

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private UserRepository userRepository;

    public void createDefaultTags(User user) {
        List<TagDTO> defaultTags = Arrays.asList(
                new TagDTO("Rent", "#FF5733", true),
                new TagDTO("Food", "#33FF57", true),
                new TagDTO("Misc", "#3357FF", true)
        );

        for (TagDTO tagDTO : defaultTags) {
            Optional<Tag> existingTag = tagRepository.findByNameAndUsers(tagDTO.getName(), user);

            if (existingTag.isEmpty()) {
                Tag tag = new Tag();
                tag.setName(tagDTO.getName());
                tag.setColor(tagDTO.getColor());
                tag.setDefault(true);
                tag.getUser().add(user);

                Tag savedTag = tagRepository.save(tag);
                user.getTags().add(savedTag);
            }
        }
        userRepository.save(user);
    }

    public Tag getOrCreateMiscTag(User user) {
        Optional<Tag> miscTag = tagRepository.findByNameAndUsers("Misc", user);
        if (miscTag.isPresent()) {
            return miscTag.get();
        }

        TagDTO miscDTO = new TagDTO("Misc", "#3357FF", true);
        Tag tag = new Tag();
        tag.setName(miscDTO.getName());
        tag.setColor(miscDTO.getColor());
        tag.setDefault(true);
        tag.getUser().add(user);

        return tagRepository.save(tag);
    }

    @PostMapping("/add")
    public ResponseEntity<?> createTag(@RequestBody @Valid TagDTO tagDTO, @RequestParam Integer user_id) {
        Optional<User> userOptional = userRepository.findById(user_id);
        if (userOptional.isEmpty()) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        User user = userOptional.get();

        if (tagRepository.existsByNameAndUsers(tagDTO.getName(), user)) {
            return new ResponseEntity<>("Tag with this name already exists", HttpStatus.BAD_REQUEST);
        }

        Tag tag = new Tag();
        tag.setName(tagDTO.getName());
        tag.setColor(tagDTO.getColor() != null ? tagDTO.getColor() : "#808080");
        tag.setDefault(tagDTO.isDefault());  // Add this line
        tag.getUser().add(user);

        Tag saveTag = tagRepository.save(tag);
        user.getTags().add(saveTag);
        userRepository.save(user);

        return new ResponseEntity<>(saveTag, HttpStatus.CREATED);
    }
    @GetMapping("/user/{user_id}")
    public ResponseEntity<?> getUserTags(@PathVariable Integer user_id) {
        Optional<User> userOptional = userRepository.findById(user_id);
        if (userOptional.isEmpty()) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        List<Tag> tags = userOptional.get().getTags();
        return new ResponseEntity<>(tags, HttpStatus.OK);
    }

    @GetMapping("/{tag_id}")
    public ResponseEntity<?> getTagById(@PathVariable Integer tag_id){

        Optional<Tag> tagOptional = tagRepository.findById(tag_id);
        if(tagOptional.isEmpty()){
            return new ResponseEntity<>("Tag not found", HttpStatus.NOT_FOUND);
        }

        Tag tag = tagOptional.get();
        return new ResponseEntity<>(tag, HttpStatus.OK);


    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTag(@PathVariable Integer id, @RequestBody @Valid TagDTO tagDTO, @RequestParam Integer user_id) {
        Optional<Tag> tagOptional = tagRepository.findById(id);
        if (tagOptional.isEmpty()) {
            return new ResponseEntity<>("Tag not found", HttpStatus.NOT_FOUND);
        }

        Tag tag = tagOptional.get();
        if (tag.isDefault()) {
            return new ResponseEntity<>("Cannot modify default tags", HttpStatus.BAD_REQUEST);
        }

        tag.setName(tagDTO.getName());
        tag.setColor(tagDTO.getColor());

        Tag updatedTag = tagRepository.save(tag);
        return new ResponseEntity<>(updatedTag, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteTag(@PathVariable Integer id, @RequestParam Integer user_id) {
        Optional<Tag> tagOptional = tagRepository.findById(id);
        if (tagOptional.isEmpty()) {
            return new ResponseEntity<>("Tag not found", HttpStatus.NOT_FOUND);
        }

        Tag tag = tagOptional.get();
        System.out.println("Is Default: " + tag.isDefault());

        if  (Boolean.TRUE.equals(tag.isDefault())) {
            return new ResponseEntity<>("Cannot delete default tags", HttpStatus.BAD_REQUEST);
        }

        if (tag.isDefault()) {
            return new ResponseEntity<>("Cannot delete default tags", HttpStatus.BAD_REQUEST);
        }

        if (!tag.getUser().stream().anyMatch(user -> user.getUser_id() == user_id)) {
            return new ResponseEntity<>("Unauthorized to delete this tag", HttpStatus.UNAUTHORIZED);
        }

        User user = userRepository.findById(user_id).get();
        Tag miscTag = getOrCreateMiscTag(user);

        tag.getTransactions().forEach(transaction -> transaction.setTag(miscTag));
        tag.getRecurringTransactions().forEach(recurringTransaction -> recurringTransaction.setTag(miscTag));

        tag.getUser().forEach(u -> u.getTags().remove(tag));

        tagRepository.deleteById(id);
        return new ResponseEntity<>("Tag deleted successfully", HttpStatus.OK);
    }

}
